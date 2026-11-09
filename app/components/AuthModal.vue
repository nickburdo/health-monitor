<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { applySession, login, register, startGoogleSignIn } from '~/lib/api/auth';
import { ApiError } from '~/lib/api/client';

const { authModal, closeAuthModal, openAuthModal } = useAuth();

const username = ref('');
const password = ref('');
const usernameError = ref('');
const passwordError = ref('');
const formError = ref('');
const submitting = ref(false);
const usernameInput = ref<HTMLInputElement | null>(null);

const isOpen = computed(() => authModal.value !== 'closed');
const isRegister = computed(() => authModal.value === 'register');

const copy = computed(() =>
  isRegister.value
    ? {
        title: 'Create an account',
        lead: 'Pick a username and a password. No email needed.',
        submit: 'Create account',
        submitting: 'Creating…',
        switchText: 'Already have an account?',
        switchAction: 'Sign in',
      }
    : {
        title: 'Sign in',
        lead: 'Sign in to see and add your own entries.',
        submit: 'Sign in',
        submitting: 'Signing in…',
        switchText: 'No account yet?',
        switchAction: 'Create an account',
      },
);

function clearErrors() {
  usernameError.value = '';
  passwordError.value = '';
  formError.value = '';
}

function resetForm() {
  username.value = '';
  password.value = '';
  clearErrors();
}

function switchMode() {
  clearErrors();
  openAuthModal(isRegister.value ? 'signIn' : 'register');
}

function close() {
  if (!submitting.value) {
    closeAuthModal();
  }
}

function firstMessage(messages: string[] | undefined) {
  return messages?.[0] ?? '';
}

function showError(error: unknown) {
  if (!(error instanceof ApiError)) {
    formError.value = 'Something went wrong. Please try again.';
    return;
  }

  if (error.status === 409) {
    usernameError.value = 'This username is taken.';
    return;
  }

  if (error.status === 401 && error.message === 'Invalid credentials') {
    formError.value = 'Wrong username or password. If you signed up with Google, use the Google button.';
    return;
  }

  if (error.status === 400 && error.details) {
    usernameError.value = firstMessage(error.details.username);
    passwordError.value = firstMessage(error.details.password);

    if (!usernameError.value && !passwordError.value) {
      formError.value = error.description;
    }

    return;
  }

  formError.value = error.status === 0 ? 'Could not reach the server. Please try again.' : error.description;
}

async function submit() {
  if (submitting.value) {
    return;
  }

  clearErrors();
  submitting.value = true;

  try {
    const credentials = { username: username.value.trim(), password: password.value };
    const response = isRegister.value ? await register(credentials) : await login(credentials);

    // Reloads the app, so the modal state does not need resetting.
    applySession(response.token);
  } catch (error) {
    showError(error);
    submitting.value = false;
  }
}

function continueWithGoogle() {
  clearErrors();

  if (!startGoogleSignIn()) {
    formError.value = 'Google sign-in needs browser storage. Allow site data and try again.';
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

watch(
  authModal,
  async (mode, previousMode) => {
    if (mode === 'closed') {
      window.removeEventListener('keydown', handleKeydown);
      return;
    }

    if (previousMode === 'closed' || previousMode === undefined) {
      resetForm();
      window.addEventListener('keydown', handleKeydown);
    }

    await nextTick();
    usernameInput.value?.focus();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="close"
    >
      <section
        class="health-modal health-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Account
            </div>
            <h2
              id="auth-modal-title"
              class="health-modal-title"
            >
              {{ copy.title }}
            </h2>
            <p class="health-modal-lead">
              {{ copy.lead }}
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close sign-in dialog"
            @click="close"
          >
            ×
          </button>
        </header>

        <form
          class="health-form-grid health-modal-body"
          novalidate
          @submit.prevent="submit"
        >
          <label class="health-field">
            <span>Username</span>
            <input
              ref="usernameInput"
              v-model="username"
              type="text"
              class="health-input"
              name="username"
              autocomplete="username"
              autocapitalize="off"
              spellcheck="false"
              required
              :minlength="isRegister ? 3 : undefined"
              :maxlength="isRegister ? 32 : undefined"
              :pattern="isRegister ? '[A-Za-z0-9_\\-]+' : undefined"
              :aria-invalid="usernameError ? 'true' : undefined"
              aria-describedby="auth-username-hint auth-username-error"
            >
            <small
              v-if="isRegister"
              id="auth-username-hint"
              class="health-form-note"
            >
              3–32 characters: letters, digits, _ and -.
            </small>
            <small
              v-if="usernameError"
              id="auth-username-error"
              class="health-form-error"
            >
              {{ usernameError }}
            </small>
          </label>

          <label class="health-field">
            <span>Password</span>
            <input
              v-model="password"
              type="password"
              class="health-input"
              name="password"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              required
              :minlength="isRegister ? 8 : undefined"
              maxlength="128"
              :aria-invalid="passwordError ? 'true' : undefined"
              aria-describedby="auth-password-hint auth-password-error"
            >
            <small
              v-if="isRegister"
              id="auth-password-hint"
              class="health-form-note"
            >
              At least 8 characters. We don't ask for an email, so we can't reset your password. If you forget it,
              your account is lost. Signing in with Google is more reliable.
            </small>
            <small
              v-if="passwordError"
              id="auth-password-error"
              class="health-form-error"
            >
              {{ passwordError }}
            </small>
          </label>

          <p
            v-if="formError"
            class="health-form-error"
            role="alert"
          >
            {{ formError }}
          </p>

          <p
            v-if="isRegister"
            class="health-form-note"
          >
            One account works in Health Monitor and Job Tracker.
          </p>

          <button
            type="submit"
            class="health-button"
            :disabled="submitting"
          >
            {{ submitting ? copy.submitting : copy.submit }}
          </button>
        </form>

        <div class="health-auth-divider">
          or
        </div>

        <button
          type="button"
          class="health-button health-button-secondary health-auth-google-button"
          :disabled="submitting"
          @click="continueWithGoogle"
        >
          <UIcon
            name="i-simple-icons-google"
            class="nav-icon"
            aria-hidden="true"
          />
          <span>Continue with Google</span>
        </button>

        <p class="health-form-note health-auth-switch">
          {{ copy.switchText }}
          <button
            type="button"
            class="health-text-button"
            :disabled="submitting"
            @click="switchMode"
          >
            {{ copy.switchAction }}
          </button>
        </p>
      </section>
    </div>
  </Teleport>
</template>
