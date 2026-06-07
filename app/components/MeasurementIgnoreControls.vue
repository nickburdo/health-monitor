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
    return data?.statusMessage ?? data?.message ?? 'Не удалось изменить статус';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Не удалось изменить статус';
}

async function ignoreSelected() {
  const normalizedReason = String(ignoreReason.value ?? '').trim();

  if (!normalizedReason) {
    errorText.value = 'reason обязателен';
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
      title: 'Запись помечена как ignored',
      description: 'Причина сохранена в reason.',
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
      title: 'Запись восстановлена',
      description: 'Статус ignored снят без подтверждения.',
    });

    await refreshNuxtData(props.refreshKey);
  } catch (error) {
    toast.add({
      title: 'Восстановление не удалось',
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
    title="Игнорировать"
    aria-label="Игнорировать"
    @click="openIgnoreDialog"
  >
    <UIcon name="i-lucide-eye-off" />
    <span class="sr-only">Игнорировать</span>
  </button>
  <button
    v-else
    type="button"
    class="health-button health-button-small health-table-icon-button"
    :disabled="savingId === item.id"
    title="Восстановить"
    aria-label="Восстановить"
    @click="restoreSelected"
  >
    <UIcon name="i-lucide-undo-2" />
    <span class="sr-only">Восстановить</span>
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
              Игнорировать запись {{ entityLabel }}
            </h2>
            <p class="health-modal-lead">
              {{ ignoreLead ?? 'Укажите причину игнорирования. Эта запись сохранит reason вместе со статусом ignored.' }}
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
              :placeholder="reasonPlaceholder ?? 'Например: причина, по которой запись не должна участвовать в статистике'"
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
            Без reason игнорирование недоступно.
          </p>

          <div class="health-modal-buttons">
            <button
              type="button"
              class="health-button health-button-secondary health-button-small health-table-icon-button"
              @click="closeIgnoreDialog"
            >
              <UIcon name="i-lucide-x" />
              <span class="sr-only">Отмена</span>
            </button>
            <button
              type="button"
              class="health-button health-button-small health-table-icon-button"
              :disabled="savingId === item.id"
              @click="ignoreSelected"
            >
              <UIcon name="i-lucide-check" />
              <span class="sr-only">Подтвердить</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
