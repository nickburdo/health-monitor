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
const savingId = ref<string | null>(null);
const errorText = ref('');
let onKeydown: ((event: KeyboardEvent) => void) | null = null;

const formatDateTime = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatWhen(value: string) {
  return formatDateTime.format(new Date(value));
}

function glucoseToMmol(value: number | null) {
  return value === null ? null : value / 18;
}

function formatValue(item: GlucoseRow) {
  const fasting = glucoseToMmol(item.fastingValue);
  const afterMeal = glucoseToMmol(item.afterMealValue);

  if (fasting !== null && afterMeal !== null) {
    return `${fasting.toFixed(1)} / ${afterMeal.toFixed(1)} mmol/L`;
  }

  const value = afterMeal ?? fasting;
  return value === null ? '—' : `${value.toFixed(1)} mmol/L`;
}

function formatType(item: GlucoseRow) {
  if (item.fastingValue !== null && item.afterMealValue !== null) {
    return 'Натощак и после еды';
  }

  if (item.afterMealValue !== null) {
    return 'После еды';
  }

  return 'Натощак';
}

function openIgnoreDialog(item: GlucoseRow) {
  activeItem.value = item;
  ignoreNote.value = '';
  errorText.value = '';
  ignoreDialogOpen.value = true;
}

function closeIgnoreDialog() {
  ignoreDialogOpen.value = false;
  activeItem.value = null;
  ignoreNote.value = '';
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

  const note = ignoreNote.value.trim();

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

async function restoreItem(item: GlucoseRow) {
  try {
    savingId.value = item.id;

    await $fetch(`/api/glucose/${item.id}/ignore`, {
      method: 'PATCH',
      body: {
        ignore: false,
      },
    });

    toast.add({
      title: 'Запись восстановлена',
      description: 'Статус ignored снят без подтверждения.',
    });

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
    if (event.key === 'Escape' && ignoreDialogOpen.value) {
      closeIgnoreDialog();
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
        <p class="health-section-subtitle">
          Игнорирование требует подтверждения с обязательным note. Восстановление
          выполняется сразу.
        </p>
      </div>
    </div>

    <div class="health-table-wrap">
      <table class="health-table">
        <thead>
          <tr>
            <th>Тип</th>
            <th>Дата и время</th>
            <th>Значение</th>
            <th>Notes</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in props.items"
            :key="item.id"
            class="health-table-row"
            :data-ignored="item.ignore"
          >
            <td>{{ formatType(item) }}</td>
            <td>{{ formatWhen(item.measuredAt) }}</td>
            <td>{{ formatValue(item) }}</td>
            <td class="health-table-note">
              {{ item.note ?? '—' }}
            </td>
            <td>
              <button
                v-if="!item.ignore"
                type="button"
                class="health-button health-button-secondary health-button-small"
                :disabled="savingId === item.id"
                @click="openIgnoreDialog(item)"
              >
                Игнорировать
              </button>
              <button
                v-else
                type="button"
                class="health-button health-button-small"
                :disabled="savingId === item.id"
                @click="restoreItem(item)"
              >
                Восстановить
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
              <strong>Тип:</strong> {{ activeItem ? formatType(activeItem) : '—' }}
            </p>
            <p>
              <strong>Дата:</strong>
              {{ activeItem ? formatWhen(activeItem.measuredAt) : '—' }}
            </p>
            <p>
              <strong>Значение:</strong>
              {{ activeItem ? formatValue(activeItem) : '—' }}
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
                class="health-button health-button-secondary"
                @click="closeIgnoreDialog"
              >
                Отмена
              </button>
              <button
                type="button"
                class="health-button"
                :disabled="savingId === activeItem?.id"
                @click="ignoreSelected"
              >
                {{ savingId === activeItem?.id ? 'Сохранение…' : 'Подтвердить' }}
              </button>
            </div>
          </footer>
        </section>
      </div>
    </Teleport>
  </article>
</template>
