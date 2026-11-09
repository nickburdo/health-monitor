import { useAuth } from '~/composables/useAuth';

export type ApiErrorDetails = Record<string, string[] | undefined>;

export class ApiError extends Error {
  readonly status: number;
  readonly details?: ApiErrorDetails;
  // True when the client already reacted (guest prompt or session reset): callers skip their toast.
  readonly handled: boolean;

  constructor(status: number, message: string, details?: ApiErrorDetails, handled = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.handled = handled;
  }

  // Message plus the first field messages, for toasts.
  get description() {
    const fieldMessages = Object.values(this.details ?? {})
      .flatMap(messages => messages ?? [])
      .slice(0, 3);

    return fieldMessages.length > 0 ? fieldMessages.join(' ') : this.message;
  }
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, string | undefined>;
  body?: Record<string, unknown>;
};

type ErrorBody = {
  error?: {
    message?: string;
    details?: ApiErrorDetails;
  };
};

const AUTH_REQUIRED = 'Authentication required';
const INVALID_TOKEN = 'Invalid or expired token';
const NOTICE_KEY = 'health-monitor-notice';

// The API answers 401 to a stale token even here, so these never carry it.
const ANONYMOUS_PATHS = new Set(['/auth/register', '/auth/login']);

let apiFetch: typeof $fetch | null = null;

function getApiFetch() {
  if (!apiFetch) {
    apiFetch = $fetch.create({
      baseURL: useRuntimeConfig().public.apiBase,
      onRequest({ request, options }) {
        const { token } = useAuth();

        if (token.value && !ANONYMOUS_PATHS.has(String(request))) {
          options.headers.set('Authorization', `Bearer ${token.value}`);
        }
      },
    });
  }

  return apiFetch;
}

export type DeferredNotice = 'session-expired' | 'account-deleted';

// A toast that must survive the full reload that follows a session change.
export function setDeferredNotice(notice: DeferredNotice) {
  try {
    sessionStorage.setItem(NOTICE_KEY, notice);
  } catch {
    // The notice is optional.
  }
}

// Returns the pending notice once, after the reload.
export function consumeDeferredNotice(): DeferredNotice | null {
  try {
    const notice = sessionStorage.getItem(NOTICE_KEY);
    sessionStorage.removeItem(NOTICE_KEY);

    return notice === 'session-expired' || notice === 'account-deleted' ? notice : null;
  } catch {
    return null;
  }
}

function expireSession() {
  useAuth().clearToken();
  setDeferredNotice('session-expired');
  reloadNuxtApp({ persistState: false, path: useRouter().currentRoute.value.fullPath });
}

// Shape of the FetchError thrown by $fetch (ofetch) for an HTTP error response.
type FetchErrorLike = {
  response?: Response;
  data?: unknown;
};

function toApiError(error: unknown, path: string): ApiError {
  const response = (error as FetchErrorLike | null)?.response;

  if (!response) {
    return new ApiError(0, 'Could not reach the server');
  }

  const status = response.status;
  const body = (error as FetchErrorLike).data as ErrorBody | undefined;
  const message = body?.error?.message || response.statusText || 'Request failed';
  const details = body?.error?.details;

  if (status === 401 && message === INVALID_TOKEN && !ANONYMOUS_PATHS.has(path)) {
    expireSession();
    return new ApiError(status, message, details, true);
  }

  if (status === 401 && message === AUTH_REQUIRED) {
    useAuth().guestPromptOpen.value = true;
    return new ApiError(status, message, details, true);
  }

  return new ApiError(status, message, details);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  try {
    const response = await getApiFetch()<{ data: T } | undefined>(path, options);

    // 204 No Content has no body.
    return response?.data as T;
  } catch (error) {
    throw toApiError(error, path);
  }
}

// Toast text for any error thrown by an API call; null when the client already reacted.
export function apiErrorDescription(error: unknown, fallback: string): string | null {
  if (error instanceof ApiError) {
    return error.handled ? null : error.description;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}
