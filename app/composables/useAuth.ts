import type { AuthUser } from '~/types/auth';

export type AuthModalMode = 'closed' | 'signIn' | 'register';

const TOKEN_KEY = 'health-monitor-token';

// Shared sign-in state: the token decides guest vs user for every API request.
export function useAuth() {
  const token = useState<string | null>('auth-token', () => null);
  const user = useState<AuthUser | null>('auth-user', () => null);
  const authModal = useState<AuthModalMode>('auth-modal', () => 'closed');
  const guestPromptOpen = useState<boolean>('guest-prompt-open', () => false);
  const deleteAccountOpen = useState<boolean>('delete-account-open', () => false);

  const isGuest = computed(() => !token.value);

  function loadStoredToken() {
    try {
      token.value = localStorage.getItem(TOKEN_KEY);
    } catch {
      token.value = null;
    }
  }

  function saveToken(value: string) {
    token.value = value;

    try {
      localStorage.setItem(TOKEN_KEY, value);
    } catch {
      // Storage may be blocked; the session then lasts until reload.
    }
  }

  function clearToken() {
    token.value = null;
    user.value = null;

    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing stored or storage blocked.
    }
  }

  function openAuthModal(mode: Exclude<AuthModalMode, 'closed'>) {
    guestPromptOpen.value = false;
    authModal.value = mode;
  }

  function closeAuthModal() {
    authModal.value = 'closed';
  }

  return {
    token,
    user,
    authModal,
    guestPromptOpen,
    deleteAccountOpen,
    isGuest,
    loadStoredToken,
    saveToken,
    clearToken,
    openAuthModal,
    closeAuthModal,
  };
}
