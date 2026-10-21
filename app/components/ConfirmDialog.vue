<script setup lang="ts">
const { state, accept, cancel } = useConfirm();

const cancelButton = ref<HTMLButtonElement | null>(null);
let previousFocus: HTMLElement | null = null;

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    cancel();
  }
}

watch(
  () => state.value.open,
  async (isOpen) => {
    if (isOpen) {
      previousFocus = document.activeElement as HTMLElement | null;
      window.addEventListener('keydown', handleKeydown);

      // Focus Cancel so a stray Enter never confirms a destructive action.
      await nextTick();
      cancelButton.value?.focus();
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

  // Each page mounts its own HealthShell: cancel on navigation so a pending
  // dialog never reappears on the next page with the old caller still waiting.
  if (state.value.open) {
    cancel();
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.open && state.options"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="cancel"
    >
      <section
        class="health-modal health-modal-compact"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Confirm action
            </div>
            <h2
              id="confirm-dialog-title"
              class="health-modal-title"
            >
              {{ state.options.title }}
            </h2>
            <p
              id="confirm-dialog-message"
              class="health-modal-lead"
            >
              {{ state.options.message }}
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close confirm dialog"
            @click="cancel"
          >
            ×
          </button>
        </header>

        <footer class="health-modal-actions">
          <div class="health-modal-buttons">
            <button
              ref="cancelButton"
              type="button"
              class="health-button health-button-secondary"
              @click="cancel"
            >
              {{ state.options.cancelLabel }}
            </button>
            <button
              type="button"
              class="health-button"
              :class="{ 'health-button-danger': state.options.danger }"
              @click="accept"
            >
              {{ state.options.confirmLabel }}
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
