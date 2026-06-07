<script setup lang="ts">
type GlucoseRow = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
};

const props = defineProps<{
  items: GlucoseRow[];
}>();

const toast = useToast();
const ignoreDialogOpen = ref(false);
const activeItem = ref<GlucoseRow | null>(null);
const ignoreNote = ref('');
const restoreDialogOpen = ref(false);
const restoreItem = ref<GlucoseRow | null>(null);
const restoreNote = ref('');
const savingId = ref<string | null>(null);
const errorText = ref('');
let onKeydown: ((event: KeyboardEvent) => void) | null = null;

const formatDateTime = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDateOnly = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const formatTimeOnly = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatWhen(value: string) {
  return formatDateTime.format(new Date(value));
}

function formatWhenParts(value: string) {
  const date = new Date(value);

  return {
    date: formatDateOnly.format(date),
    time: formatTimeOnly.format(date),
  };
}

function glucoseToMmol(value: number | null) {
  return value === null ? null : value / 18;
}

function formatValueParts(item: GlucoseRow) {
  const fasting = glucoseToMmol(item.fastingValue);
  const afterMeal = glucoseToMmol(item.afterMealValue);

  if (fasting !== null && afterMeal !== null) {
    return {
      value: `${fasting.toFixed(1)} / ${afterMeal.toFixed(1)}`,
      unit: 'mmol/L',
    };
  }

  const value = afterMeal ?? fasting;

  return value === null
    ? {
        value: '—',
        unit: '',
      }
    : {
        value: value.toFixed(1),
        unit: 'mmol/L',
      };
}

function formatMeasurementType(item: GlucoseRow) {
  if (item.fastingValue !== null && item.afterMealValue !== null) {
    return 'Натощак и после еды';
  }

  if (item.afterMealValue !== null) {
    return 'После еды';
  }

  return 'Натощак';
}

function typeEmoji(item: GlucoseRow) {
  return item.afterMealValue !== null ? '🍏' : '🍎';
}

function openIgnoreDialog(item: GlucoseRow) {
  activeItem.value = item;
  ignoreNote.value = '';
  errorText.value = '';
  ignoreDialogOpen.value = true;
}

function openRestoreDialog(item: GlucoseRow) {
  restoreItem.value = item;
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

async function ignoreSelected() {
  if (!activeItem.value) {
    return;
  }

  const note = String(ignoreNote.value ?? '').trim();

  if (!note) {
    errorText.value = 'note обязателен';
    return;
  }

  try {
    savingId.value = activeItem.value.id;

    await $fetch(`/api/glucose/${activeItem.value.id}/ignore`, {
      method: 'PATCH',
      body: {
        ignore: true,
        note,
      },
    });

    toast.add({
      title: 'Запись помечена как ignored',
      description: 'Причина сохранена в note.',
    });

    closeIgnoreDialog();
    await refreshNuxtData('glucose-page');
  } catch (error) {
    errorText.value = errorMessage(error);
  } finally {
    savingId.value = null;
  }
}

async function restoreSelected() {
  if (!restoreItem.value) {
    return;
  }

  const note = String(restoreNote.value ?? '').trim();

  if (!note) {
    errorText.value = 'note обязателен';
    return;
  }

  try {
    savingId.value = restoreItem.value.id;

    await $fetch(`/api/glucose/${restoreItem.value.id}/ignore`, {
      method: 'PATCH',
      body: {
        ignore: false,
        note,
      },
    });

    toast.add({
      title: 'Запись восстановлена',
      description: 'Статус ignored снят без подтверждения.',
    });

    closeRestoreDialog();
    await refreshNuxtData('glucose-page');
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

onMounted(() => {
  onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && (ignoreDialogOpen.value || restoreDialogOpen.value)) {
      closeIgnoreDialog();
      closeRestoreDialog();
    }
  };

  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  if (onKeydown) {
    window.removeEventListener('keydown', onKeydown);
  }
});
</script>

<template>
  <article class="health-panel health-table-panel">
    <div class="health-table-header">
      <div>
        <h2 class="health-section-title">
          История глюкозы
        </h2>
      </div>
    </div>

    <div class="health-table-wrap">
      <table class="health-table">
        <thead>
          <tr>
            <th>
              <span class="health-table-head-date health-table-head-date-measurement">
                <span class="health-table-head-date-full">Дата Время</span>
                <span class="health-table-head-date-short">ДАТА</span>
              </span>
            </th>
            <th>
              <span class="health-table-head-value">
                <span class="health-table-head-value-full">ЗНАЧЕНИЕ</span>
                <span class="health-table-head-value-short">ЗНАЧ.</span>
              </span>
            </th>
            <th>ЗАМЕТКИ</th>
            <th
              class="health-table-action-head"
              aria-label="Действие"
            >
              <span class="sr-only">Действие</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in props.items"
            :key="item.id"
            class="health-table-row"
            :data-ignored="item.ignore"
          >
            <td class="health-table-cell-date health-table-cell-date-glucose">
              <span class="health-table-date">
                <span
                  class="health-table-type-icon"
                  role="img"
                  :aria-label="formatMeasurementType(item)"
                  :title="formatMeasurementType(item)"
                >
                  {{ typeEmoji(item) }}
                </span>
                <span class="health-table-date-text">
                  <span class="health-table-date-main">{{ formatWhenParts(item.measuredAt).date }}</span>
                  <span class="health-table-date-sub">{{ formatWhenParts(item.measuredAt).time }}</span>
                </span>
              </span>
            </td>
            <td class="health-table-cell-value">
              <span class="health-table-value">
                <span class="health-table-value-main">{{ formatValueParts(item).value }}</span>
                <span
                  v-if="formatValueParts(item).unit"
                  class="health-table-value-sub"
                >
                  {{ formatValueParts(item).unit }}
                </span>
              </span>
            </td>
            <td class="health-table-note health-table-note-cell">
              {{ item.note ?? '—' }}
            </td>
            <td class="health-table-action-cell">
              <button
                v-if="!item.ignore"
                type="button"
                class="health-button health-button-secondary health-button-small health-table-icon-button"
                :disabled="savingId === item.id"
                title="Игнорировать"
                aria-label="Игнорировать"
                @click="openIgnoreDialog(item)"
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
                @click="openRestoreDialog(item)"
              >
                <UIcon name="i-lucide-undo-2" />
                <span class="sr-only">Восстановить</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
          aria-labelledby="glucose-ignore-title"
        >
          <header class="health-modal-header">
            <div>
              <div class="health-eyebrow">
                Confirm dialog
              </div>
              <h2
                id="glucose-ignore-title"
                class="health-modal-title"
              >
                Игнорировать запись глюкозы
              </h2>
              <p class="health-modal-lead">
                Укажите причину игнорирования. Эта заметка будет сохранена вместе
                со статусом ignored и не потеряется при восстановлении.
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
            <p>
              <strong>Тип:</strong> {{ activeItem ? formatMeasurementType(activeItem) : '—' }}
            </p>
            <p>
              <strong>Дата:</strong>
              {{ activeItem ? formatWhen(activeItem.measuredAt) : '—' }}
            </p>
            <p>
              <strong>Значение:</strong>
              {{ activeItem ? formatValueParts(activeItem).value : '—' }}
              <span v-if="activeItem && formatValueParts(activeItem).unit">
                {{ formatValueParts(activeItem).unit }}
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
                placeholder="Например: подозрительно высокий показатель после плотного ужина"
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
          aria-labelledby="glucose-restore-title"
        >
          <header class="health-modal-header">
            <div>
              <div class="health-eyebrow">
                Confirm dialog
              </div>
              <h2
                id="glucose-restore-title"
                class="health-modal-title"
              >
                Восстановить запись глюкозы
              </h2>
              <p class="health-modal-lead">
                Укажите note для восстановления. Запись снова станет активной.
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
            <p>
              <strong>Тип:</strong> Восстановление
            </p>
            <p>
              <strong>Дата:</strong>
              {{ restoreItem ? formatWhen(restoreItem.measuredAt) : '—' }}
            </p>
            <p>
              <strong>Значение:</strong>
              {{ restoreItem ? formatValueParts(restoreItem).value : '—' }}
              <span v-if="restoreItem && formatValueParts(restoreItem).unit">
                {{ formatValueParts(restoreItem).unit }}
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
                placeholder="Например: запись была помечена ошибочно"
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
  </article>
</template>
