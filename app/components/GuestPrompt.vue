<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const { authModal, guestPromptOpen, openAuthModal } = useAuth();

const signInButton = ref<HTMLButtonElement | null>(null);
let previousFocus: HTMLElement | null = null;

function close() {
  guestPromptOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

watch(
  guestPromptOpen,
  async (isOpen) => {
    if (isOpen) {
      previousFocus = document.activeElement as HTMLElement | null;
      window.addEventListener('keydown', handleKeydown);
      await nextTick();
      signInButton.value?.focus();
      return;
    }

    window.removeEventListener('keydown', handleKeydown);

    // Return focus unless the sign-in dialog took over.
    if (authModal.value === 'closed') {
      previousFocus?.focus();
    }

    previousFocus = null;
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
      v-if="guestPromptOpen"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="close"
    >
      <section
        class="health-modal health-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-prompt-title"
        aria-describedby="guest-prompt-message"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Demo mode
            </div>
            <h2
              id="guest-prompt-title"
              class="health-modal-title"
            >
              Sign in to add your own data
            </h2>
            <p
              id="guest-prompt-message"
              class="health-modal-lead"
            >
              Guests see demo data and can't change it. After you sign in, you see and edit only your own entries —
              the demo data is hidden.
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close dialog"
            @click="close"
          >
            ×
          </button>
        </header>

        <p class="health-modal-summary health-guest-prompt-note">
          Registration asks only for a username and password — we never ask for your email.
        </p>

        <footer class="health-modal-actions">
          <div class="health-modal-buttons health-guest-prompt-buttons">
            <button
              type="button"
              class="health-button health-button-secondary"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="button"
              class="health-button health-button-secondary"
              @click="openAuthModal('register')"
            >
              Create account
            </button>
            <button
              ref="signInButton"
              type="button"
              class="health-button"
              @click="openAuthModal('signIn')"
            >
              Sign in
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
