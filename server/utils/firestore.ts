import { getFirestore } from 'firebase-admin/firestore';
import { firebaseAdminApp } from './firebase-admin';

export const db = getFirestore(firebaseAdminApp);
