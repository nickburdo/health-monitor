import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from '~/lib/firebase.client';

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export const useFirebaseAuth = () => {
  const user = useState<AuthUser | null>('firebase-user', () => null);
  const isLoading = useState('firebase-auth-loading', () => true);

  const loginByGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      await signInWithPopup(firebaseAuth, provider);
    } catch (error) {
      console.error('Google sign-in failed', error);

      throw error;
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
  };

  const getIdToken = async () => {
    return firebaseAuth.currentUser?.getIdToken();
  };

  if (import.meta.client) {
    onAuthStateChanged(firebaseAuth, (currentUser) => {
      user.value = currentUser
        ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          }
        : null;
      isLoading.value = false;
    });
  }

  return {
    user,
    isLoading,
    isAuthenticated: computed(() => Boolean(user.value)),
    loginByGoogle,
    logout,
    getIdToken,
  };
};
