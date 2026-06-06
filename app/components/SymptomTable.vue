<script setup lang="ts">
type SymptomRow = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  note: string | null;
};

const props = defineProps<{
  items: SymptomRow[];
}>();

const toast = useToast();
const editingId = ref<string | null>(null);
const savingId = ref<string | null>(null);
const draftNote = ref('');

const formatDateOnly = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const formatTimeOnly = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatWhenParts(value: string) {
  const date = new Date(value);

  return {
    date: formatDateOnly.format(date),
    time: formatTimeOnly.format(date),
  };
}

function startEditing(item: SymptomRow) {
  editingId.value = item.id;
  draftNote.value = item.note ?? '';
}

function cancelEditing() {
  editingId.value = null;
  draftNote.value = '';
}

function normalizeNote(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string; message?: string } }).data;
    return data?.statusMessage ?? data?.message ?? 'Не удалось обновить заметку';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Не удалось обновить заметку';
}

async function saveNote(item: SymptomRow) {
  if (savingId.value) {
    return;
  }

  try {
    savingId.value = item.id;

    await $fetch(`/api/symptoms/${item.id}`, {
      method: 'PATCH',
      body: {
        note: normalizeNote(draftNote.value),
      },
    });

    toast.add({
      title: 'Заметка обновлена',
      description: 'Запись симптома сохранена.',
    });

    cancelEditing();
    await refreshNuxtData('symptoms-page');
  } catch (error) {
    toast.add({
      title: 'Обновление не удалось',
      description: errorMessage(error),
      color: 'error',
    });
  } finally {
    savingId.value = null;
  }
}
</script>

<template>
  <article class="health-panel health-table-panel">
    <div class="health-table-header">
      <div>
        <h2 class="health-section-title">
          История симптомов
        </h2>
        <p class="health-section-subtitle">
          В этой таблице редактируется только заметка.
        </p>
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
            <th>Симптом</th>
            <th>Балл</th>
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
          >
            <td class="health-table-cell-date">
              <span class="health-table-date">
                <span class="health-table-date-text">
                  <span class="health-table-date-main">{{ formatWhenParts(item.happenedAt).date }}</span>
                  <span class="health-table-date-sub">{{ formatWhenParts(item.happenedAt).time }}</span>
                </span>
              </span>
            </td>
            <td>{{ item.type }}</td>
            <td class="health-table-cell-value">
              <span class="health-table-value">
                <span class="health-table-value-main">{{ item.intensity ?? '—' }}</span>
              </span>
            </td>
            <td class="health-table-note health-table-note-cell">
              <template v-if="editingId === item.id">
                <textarea
                  v-model="draftNote"
                  class="health-table-textarea"
                  rows="3"
                  placeholder="Заметка"
                />
              </template>
              <template v-else>
                <span class="health-table-note">
                  {{ item.note ?? '—' }}
                </span>
              </template>
            </td>
            <td class="health-table-action-cell">
              <div class="health-table-actions">
                <button
                  v-if="editingId !== item.id"
                  type="button"
                  class="health-button health-button-secondary health-button-small health-table-icon-button"
                  title="Редактировать"
                  aria-label="Редактировать"
                  @click="startEditing(item)"
                >
                  <UIcon name="i-lucide-pencil" />
                  <span class="sr-only">Редактировать</span>
                </button>
                <template v-else>
                  <button
                    type="button"
                    class="health-button health-button-secondary health-button-small health-table-icon-button"
                    title="Отмена"
                    aria-label="Отмена"
                    @click="cancelEditing"
                  >
                    <UIcon name="i-lucide-x" />
                    <span class="sr-only">Отмена</span>
                  </button>
                  <button
                    type="button"
                    class="health-button health-button-small health-table-icon-button"
                    :disabled="savingId === item.id"
                    title="Сохранить"
                    aria-label="Сохранить"
                    @click="saveNote(item)"
                  >
                    <UIcon name="i-lucide-check" />
                    <span class="sr-only">
                      {{ savingId === item.id ? 'Сохранение' : 'Сохранить' }}
                    </span>
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>
