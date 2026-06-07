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
  restoreLead?: string;
  ignorePlaceholder?: string;
  restorePlaceholder?: string;
}>();

const toast = useToast();
const ignoreDialogOpen = ref(false);
const activeItem = ref<typeof props.item | null>(null);
const ignoreNote = ref('');
const restoreDialogOpen = ref(false);
const restoreItem = ref<typeof props.item | null>(null);
const restoreNote = ref('');
const savingId = ref<string | null>(null);
const errorText = ref('');
let onKeydown: ((event: KeyboardEvent) => void) | null = null;

function openIgnoreDialog() {
  activeItem.value = props.item;
  ignoreNote.value = '';
  errorText.value = '';
  ignoreDialogOpen.value = true;
}

function openRestoreDialog() {
  restoreItem.value = props.item;
  restoreNote.value = '';
  errorText.value = '';
  restoreDialogOpen.value = true;
}

function closeIgnoreDialog() {
  ignoreDialogOpen.value = false;
  activeItem.value = null;
  ignoreNote.value = '';
  errorText.value = '';
}

function closeRestoreDialog() {
  restoreDialogOpen.value = false;
  restoreItem.value = null;
  restoreNote.value = '';
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

async function submitIgnoreState(ignore: boolean, note: string) {
  const target = ignore ? activeItem.value : restoreItem.value;

  if (!target) {
    return;
  }

  const normalizedNote = String(note ?? '').trim();

  if (!normalizedNote) {
    errorText.value = 'note обязателен';
    return;
  }

  try {
    savingId.value = target.id;

    await $fetch(`${props.endpoint}/${target.id}/ignore`, {
      method: 'PATCH',
      body: {
        ignore,
        note: normalizedNote,
      },
    });

    toast.add({
      title: ignore ? 'Запись помечена как ignored' : 'Запись восстановлена',
      description: ignore
        ? 'Причина сохранена в note.'
        : 'Статус ignored снят без подтверждения.',
    });

    if (ignore) {
      closeIgnoreDialog();
    } else {
      closeRestoreDialog();
    }

    await refreshNuxtData(props.refreshKey);
  } catch (error) {
    if (!ignore) {
      toast.add({
        title: 'Восстановление не удалось',
        description: errorMessage(error),
        color: 'error',
      });
      return;
    }

    errorText.value = errorMessage(error);
  } finally {
    savingId.value = null;
  }
}

function ignoreSelected() {
  void submitIgnoreState(true, ignoreNote.value);
}

function restoreSelected() {
  void submitIgnoreState(false, restoreNote.value);
}

const isAnyDialogOpen = computed(() => ignoreDialogOpen.value || restoreDialogOpen.value);

watch(
  isAnyDialogOpen,
  (isOpen) => {
    if (isOpen) {
      onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isAnyDialogOpen.value) {
          closeIgnoreDialog();
          closeRestoreDialog();
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
    @click="openRestoreDialog"
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
              {{ ignoreLead ?? 'Укажите причину игнорирования. Эта заметка будет сохранена вместе со статусом ignored и не потеряется при восстановлении.' }}
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
            <span>note</span>
            <textarea
              v-model="ignoreNote"
              class="health-textarea"
              rows="4"
              :placeholder="ignorePlaceholder ?? 'Например: причина, по которой запись не должна участвовать в статистике'"
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
            Без note игнорирование недоступно.
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
              :disabled="savingId === activeItem?.id"
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

  <Teleport to="body">
    <div
      v-if="restoreDialogOpen"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="closeRestoreDialog"
    >
      <section
        class="health-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${entityLabel}-restore-title`"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Confirm dialog
            </div>
            <h2
              :id="`${entityLabel}-restore-title`"
              class="health-modal-title"
            >
              Восстановить запись {{ entityLabel }}
            </h2>
            <p class="health-modal-lead">
              {{ restoreLead ?? 'Укажите note для восстановления. Запись снова станет активной.' }}
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close restore dialog"
            @click="closeRestoreDialog"
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
            <span>note</span>
            <textarea
              v-model="restoreNote"
              class="health-textarea"
              rows="4"
              :placeholder="restorePlaceholder ?? 'Например: запись была помечена ошибочно'"
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
            Без note восстановление недоступно.
          </p>

          <div class="health-modal-buttons">
            <button
              type="button"
              class="health-button health-button-secondary health-button-small health-table-icon-button"
              @click="closeRestoreDialog"
            >
              <UIcon name="i-lucide-x" />
              <span class="sr-only">Отмена</span>
            </button>
            <button
              type="button"
              class="health-button health-button-small health-table-icon-button"
              :disabled="savingId === restoreItem?.id"
              @click="restoreSelected"
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
