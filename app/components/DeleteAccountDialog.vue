<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { deleteAccount } from '~/lib/api/auth';
import { apiErrorDescription } from '~/lib/api/client';

const { deleteAccountOpen, user } = useAuth();

const confirmation = ref('');
const errorText = ref('');
const deleting = ref(false);
const confirmationInput = ref<HTMLInputElement | null>(null);
let previousFocus: HTMLElement | null = null;

const username = computed(() => user.value?.username ?? '');
// Exact match only: a deliberate confirmation for an irreversible action.
const canDelete = computed(() => username.value !== '' && confirmation.value === username.value && !deleting.value);

function close() {
  if (!deleting.value) {
    deleteAccountOpen.value = false;
  }
}

async function submit() {
  if (!canDelete.value) {
    return;
  }

  errorText.value = '';
  deleting.value = true;

  try {
    // Reloads the app as a guest on success.
    await deleteAccount();
  } catch (error) {
    const message = apiErrorDescription(error, 'Could not delete the account');

    // A null message means the client already reset the session.
    if (message !== null) {
      errorText.value = `${message} Your account was not deleted. Please try again.`;
    }

    deleting.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

watch(
  deleteAccountOpen,
  async (isOpen) => {
    if (isOpen) {
      confirmation.value = '';
      errorText.value = '';
      previousFocus = document.activeElement as HTMLElement | null;
      window.addEventListener('keydown', handleKeydown);
      await nextTick();
      confirmationInput.value?.focus();
      return;
    }

    window.removeEventListener('keydown', handleKeydown);
    previousFocus?.focus();
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
      v-if="deleteAccountOpen"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="close"
    >
      <section
        class="health-modal health-modal-compact"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-message"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Danger zone
            </div>
            <h2
              id="delete-account-title"
              class="health-modal-title"
            >
              Delete your account?
            </h2>
            <p
              id="delete-account-message"
              class="health-modal-lead"
            >
              This permanently deletes your account and all its data in both apps — Health Monitor and Job Tracker.
              This cannot be undone, and the account cannot be recovered.
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close delete account dialog"
            :disabled="deleting"
            @click="close"
          >
            ×
          </button>
        </header>

        <form
          class="health-form-grid health-modal-body"
          @submit.prevent="submit"
        >
          <label class="health-field">
            <span>Type your username <strong class="health-delete-account-name">{{ username }}</strong> to confirm</span>
            <input
              ref="confirmationInput"
              v-model="confirmation"
              type="text"
              class="health-input"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              :disabled="deleting"
            >
          </label>

          <p
            v-if="errorText"
            class="health-form-error"
            role="alert"
          >
            {{ errorText }}
          </p>

          <footer class="health-modal-actions">
            <div class="health-modal-buttons">
              <button
                type="button"
                class="health-button health-button-secondary"
                :disabled="deleting"
                @click="close"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="health-button health-button-danger"
                :disabled="!canDelete"
                :data-locked="!deleting && !canDelete ? 'true' : undefined"
              >
                {{ deleting ? 'Deleting…' : 'Delete account' }}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>
