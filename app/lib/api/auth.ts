import { useAuth } from '~/composables/useAuth';
import { apiRequest, setDeferredNotice } from '~/lib/api/client';
import type { AuthCredentials, AuthResponse, AuthUser } from '~/types/auth';

const NONCE_KEY = 'googleNonce';
const CALLBACK_PATH = '/auth/callback';

export function login(credentials: AuthCredentials) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: credentials });
}

export function register(credentials: AuthCredentials) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: credentials });
}

export async function fetchMe() {
  const user = await apiRequest<AuthUser>('/auth/me');

  useAuth().user.value = user;

  return user;
}

// Stores the token and reloads, so every list is fetched again as this user.
export function applySession(token: string, path?: string) {
  useAuth().saveToken(token);
  reloadNuxtApp({
    persistState: false,
    path: path ?? useRouter().currentRoute.value.fullPath,
  });
}

// There is no logout endpoint: dropping the token returns the visitor to guest mode.
export function logout() {
  useAuth().clearToken();
  reloadNuxtApp({ persistState: false, path: useRouter().currentRoute.value.fullPath });
}

// Deletes the account and all its data in both apps (irreversible), then returns to guest mode.
export async function deleteAccount() {
  await apiRequest<undefined>('/auth/me', { method: 'DELETE' });

  useAuth().clearToken();
  setDeferredNotice('account-deleted');
  reloadNuxtApp({ persistState: false, path: '/' });
}

// Full-page redirect to Google; the nonce binds the result to this tab (frontend-guide.md, point 10).
// Returns false when the nonce cannot be stored (blocked site data): the flow cannot be secured.
export function startGoogleSignIn(): boolean {
  const nonce = crypto.randomUUID();

  try {
    sessionStorage.setItem(NONCE_KEY, nonce);
  } catch {
    return false;
  }

  const callbackUrl = new URL(CALLBACK_PATH, window.location.origin);
  callbackUrl.searchParams.set('n', nonce);

  const apiBase = useRuntimeConfig().public.apiBase;
  window.location.href = `${apiBase}/auth/google?redirect=${encodeURIComponent(callbackUrl.href)}`;

  return true;
}

export type GoogleCallbackResult
  = | { kind: 'token'; token: string }
    | { kind: 'error'; code: string }
    | { kind: 'rejected' };

// Reads the Google result from the URL, cleans the address bar and checks the single-use nonce.
export function consumeGoogleCallback(): GoogleCallbackResult {
  const result = new URLSearchParams(window.location.hash.slice(1));
  const nonce = new URLSearchParams(window.location.search).get('n');

  // Drop the fragment and ?n at once; keep history.state so Vue Router stays consistent.
  history.replaceState(history.state, '', window.location.pathname);

  let expected: string | null;

  try {
    expected = sessionStorage.getItem(NONCE_KEY);
    sessionStorage.removeItem(NONCE_KEY);
  } catch {
    expected = null;
  }

  const error = result.get('error');
  if (error) {
    return { kind: 'error', code: error };
  }

  const token = result.get('token');
  if (!token || expected === null || nonce !== expected) {
    return { kind: 'rejected' };
  }

  return { kind: 'token', token };
}

export function googleErrorMessage(code: string) {
  if (code === 'access_denied') {
    return 'Sign-in was cancelled.';
  }

  return 'Google sign-in failed. Please try again.';
}
