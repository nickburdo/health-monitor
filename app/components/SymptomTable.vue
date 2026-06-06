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

const formatDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatWhen(value: string) {
  return formatDate.format(new Date(value));
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
          В этой таблице редактируется только заметка. Статус ignore для
          симптомов не используется.
        </p>
      </div>
    </div>

    <div class="health-table-wrap">
      <table class="health-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Симптом</th>
            <th>Интенсивность</th>
            <th>Note</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in props.items"
            :key="item.id"
          >
            <td>{{ formatWhen(item.happenedAt) }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.intensity ?? '—' }}</td>
            <td>
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
            <td>
              <div class="health-table-actions">
                <button
                  v-if="editingId !== item.id"
                  type="button"
                  class="health-button health-button-secondary health-button-small"
                  @click="startEditing(item)"
                >
                  Редактировать
                </button>
                <template v-else>
                  <button
                    type="button"
                    class="health-button health-button-secondary health-button-small"
                    @click="cancelEditing"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    class="health-button health-button-small"
                    :disabled="savingId === item.id"
                    @click="saveNote(item)"
                  >
                    {{ savingId === item.id ? 'Сохранение…' : 'Сохранить' }}
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
