<script setup lang="ts">
type SummaryLine = {
  label: string;
  value: string;
  helper?: string;
};

const props = defineProps<{
  item: {
    id: string;
    ignore: boolean;
  };
  endpoint: string;
  refreshKey: string;
  entityLabel: string;
  summary: SummaryLine[];
  ignoreLead?: string;
  reasonPlaceholder?: string;
}>();

const toast = useToast();
const ignoreDialogOpen = ref(false);
const ignoreReason = ref('');
const savingId = ref<string | null>(null);
const errorText = ref('');
let onKeydown: ((event: KeyboardEvent) => void) | null = null;

function openIgnoreDialog() {
  ignoreReason.value = '';
  errorText.value = '';
  ignoreDialogOpen.value = true;
}

function closeIgnoreDialog() {
  ignoreDialogOpen.value = false;
  ignoreReason.value = '';
  errorText.value = '';
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string; message?: string } }).data;
    return data?.statusMessage ?? data?.message ?? 'Could not change the status';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not change the status';
}

async function ignoreSelected() {
  const normalizedReason = String(ignoreReason.value ?? '').trim();

  if (!normalizedReason) {
    errorText.value = 'reason is required';
    return;
  }

  try {
    savingId.value = props.item.id;

    await $fetch(`${props.endpoint}/${props.item.id}/ignore`, {
      method: 'PATCH',
      body: {
        ignore: true,
        reason: normalizedReason,
      },
    });

    toast.add({
      title: 'Entry marked ignored',
      description: 'The reason was saved in reason.',
    });

    closeIgnoreDialog();
    await refreshNuxtData(props.refreshKey);
  } catch (error) {
    errorText.value = errorMessage(error);
  } finally {
    savingId.value = null;
  }
}

async function restoreSelected() {
  try {
    savingId.value = props.item.id;

    await $fetch(`${props.endpoint}/${props.item.id}/ignore`, {
      method: 'PATCH',
      body: {
        ignore: false,
      },
    });

    toast.add({
      title: 'Entry restored',
      description: 'The ignored status was removed without confirmation.',
    });

    await refreshNuxtData(props.refreshKey);
  } catch (error) {
    toast.add({
      title: 'Restore failed',
      description: errorMessage(error),
      color: 'error',
    });
  } finally {
    savingId.value = null;
  }
}

watch(
  () => ignoreDialogOpen.value,
  (isOpen) => {
    if (isOpen) {
      onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeIgnoreDialog();
        }
      };

      window.addEventListener('keydown', onKeydown);
      return;
    }

    if (onKeydown) {
      window.removeEventListener('keydown', onKeydown);
      onKeydown = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (onKeydown) {
    window.removeEventListener('keydown', onKeydown);
  }
});
</script>

<template>
  <button
    v-if="!item.ignore"
    type="button"
    class="health-button health-button-secondary health-button-small health-table-icon-button"
    :disabled="savingId === item.id"
    title="Ignore"
    aria-label="Ignore"
    @click="openIgnoreDialog"
  >
    <UIcon name="i-lucide-eye-off" />
    <span class="sr-only">Ignore</span>
  </button>
  <button
    v-else
    type="button"
    class="health-button health-button-small health-table-icon-button"
    :disabled="savingId === item.id"
    title="Restore"
    aria-label="Restore"
    @click="restoreSelected"
  >
    <UIcon name="i-lucide-undo-2" />
    <span class="sr-only">Restore</span>
  </button>

  <Teleport to="body">
    <div
      v-if="ignoreDialogOpen"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="closeIgnoreDialog"
    >
      <section
        class="health-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${entityLabel}-ignore-title`"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Confirm dialog
            </div>
            <h2
              :id="`${entityLabel}-ignore-title`"
              class="health-modal-title"
            >
              Ignore {{ entityLabel }} entry
            </h2>
            <p class="health-modal-lead">
              {{ ignoreLead ?? 'Provide a reason for ignoring this entry. It will keep reason together with the ignored status.' }}
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close ignore dialog"
            @click="closeIgnoreDialog"
          >
            ×
          </button>
        </header>

        <div class="health-modal-summary">
          <p
            v-for="line in summary"
            :key="line.label"
          >
            <strong>{{ line.label }}:</strong> {{ line.value }}
            <span v-if="line.helper">
              {{ line.helper }}
            </span>
          </p>
        </div>

        <div class="health-form-grid">
          <label class="health-field">
            <span>reason</span>
            <textarea
              v-model="ignoreReason"
              class="health-textarea"
              rows="4"
              :placeholder="reasonPlaceholder ?? 'For example: a reason why this entry should be excluded from statistics'"
            />
          </label>
          <p
            v-if="errorText"
            class="health-form-error"
          >
            {{ errorText }}
          </p>
        </div>

        <footer class="health-modal-actions">
          <p class="health-form-note">
            Ignoring is unavailable without reason.
          </p>

          <div class="health-modal-buttons">
            <button
              type="button"
              class="health-button health-button-secondary health-button-small health-table-icon-button"
              @click="closeIgnoreDialog"
            >
              <UIcon name="i-lucide-x" />
              <span class="sr-only">Cancel</span>
            </button>
            <button
              type="button"
              class="health-button health-button-small health-table-icon-button"
              :disabled="savingId === item.id"
              @click="ignoreSelected"
            >
              <UIcon name="i-lucide-check" />
              <span class="sr-only">Confirm</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
