import { useAuth } from '~/composables/useAuth';
import { fetchMe } from '~/lib/api/auth';
import { ApiError, consumeDeferredNotice } from '~/lib/api/client';

// Restores the session before pages mount, so data is fetched once in the right mode.
export default defineNuxtPlugin(async () => {
  const { token, loadStoredToken } = useAuth();
  const toast = useToast();

  loadStoredToken();

  const notice = consumeDeferredNotice();

  if (notice === 'session-expired') {
    toast.add({
      title: 'Your session has expired. Sign in again.',
      color: 'warning',
    });
  } else if (notice === 'account-deleted') {
    toast.add({
      title: 'Your account has been deleted',
      color: 'success',
    });
  }

  if (!token.value) {
    return;
  }

  try {
    await fetchMe();
  } catch (error) {
    // A stale token is already handled by the client (token dropped, app reloaded).
    if (error instanceof ApiError && error.handled) {
      return;
    }

    // The token is kept either way: the session may still be valid.
    const noResponse = !(error instanceof ApiError) || error.status === 0;

    toast.add({
      title: noResponse ? 'Could not reach the server' : 'Could not load your account',
      color: 'error',
    });
  }
});
