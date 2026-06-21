<script setup lang="ts">
import { SYMPTOM_OPTIONS } from '../constants/symptom-options';

type EntryType = 'glucose' | 'bloodPressure' | 'weight' | 'symptom';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const toast = useToast();

const entryTypes: Array<{
  id: EntryType;
  label: string;
  description: string;
}> = [
  {
    id: 'glucose',
    label: 'Glucose',
    description: 'Fasting or after meal',
  },
  {
    id: 'bloodPressure',
    label: 'Blood pressure',
    description: 'Systolic, diastolic, pulse',
  },
  {
    id: 'weight',
    label: 'Weight',
    description: 'One number and a note',
  },
  {
    id: 'symptom',
    label: 'Symptom',
    description: 'MVP symptom list',
  },
];

function toLocalDatetimeValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function createInitialState() {
  const now = toLocalDatetimeValue();

  return {
    glucose: {
      measuredAt: now,
      fastingValue: '',
      afterMealValue: '',
      note: '',
    },
    bloodPressure: {
      measuredAt: now,
      systolic: '',
      diastolic: '',
      pulse: '',
      note: '',
    },
    weight: {
      measuredAt: now,
      value: '',
      note: '',
    },
    symptom: {
      happenedAt: now,
      type: SYMPTOM_OPTIONS[0],
      intensity: '',
      note: '',
    },
  };
}

const activeType = ref<EntryType>('glucose');
const saving = ref(false);
const form = reactive(createInitialState());

function resetForm(nextType: EntryType = 'glucose') {
  Object.assign(form, createInitialState());
  activeType.value = nextType;
}

function closeModal() {
  emit('close');
}

function parseOptionalNumber(value: unknown) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string; message?: string } }).data;
    return data?.statusMessage ?? data?.message ?? 'Could not save the entry';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not save the entry';
}

async function submit() {
  if (saving.value) {
    return;
  }

  try {
    saving.value = true;

    if (activeType.value === 'glucose') {
      const fastingValue = parseOptionalNumber(form.glucose.fastingValue);
      const afterMealValue = parseOptionalNumber(form.glucose.afterMealValue);

      if (fastingValue === undefined && afterMealValue === undefined) {
        toast.add({
          title: 'A glucose value is required',
          description: 'Fill in fasting or after meal.',
          color: 'error',
        });
        return;
      }

      await $fetch('/api/glucose', {
        method: 'POST',
        body: {
          measuredAt: toIsoDateTime(form.glucose.measuredAt),
          fastingValue,
          afterMealValue,
          note: form.glucose.note || undefined,
        },
      });
    }

    if (activeType.value === 'bloodPressure') {
      const systolic = parseOptionalNumber(form.bloodPressure.systolic);
      const diastolic = parseOptionalNumber(form.bloodPressure.diastolic);
      const pulse = parseOptionalNumber(form.bloodPressure.pulse);

      if (systolic === undefined && diastolic === undefined && pulse === undefined) {
        toast.add({
          title: 'At least one value is required',
          description: 'Enter blood pressure or pulse.',
          color: 'error',
        });
        return;
      }

      await $fetch('/api/blood-pressure', {
        method: 'POST',
        body: {
          measuredAt: toIsoDateTime(form.bloodPressure.measuredAt),
          systolic,
          diastolic,
          pulse,
          note: form.bloodPressure.note || undefined,
        },
      });
    }

    if (activeType.value === 'weight') {
      const value = parseOptionalNumber(form.weight.value);

      if (value === undefined) {
        toast.add({
          title: 'Enter a weight',
          description: 'The weight field is required for this entry.',
          color: 'error',
        });
        return;
      }

      await $fetch('/api/weight', {
        method: 'POST',
        body: {
          measuredAt: toIsoDateTime(form.weight.measuredAt),
          value,
          note: form.weight.note || undefined,
        },
      });
    }

    if (activeType.value === 'symptom') {
      const intensity = parseOptionalNumber(form.symptom.intensity);

      await $fetch('/api/symptoms', {
        method: 'POST',
        body: {
          happenedAt: toIsoDateTime(form.symptom.happenedAt),
          type: form.symptom.type,
          intensity,
          note: form.symptom.note || undefined,
        },
      });
    }

    toast.add({
      title: 'Entry saved',
      description: 'History was updated and the summary was recalculated.',
    });

    resetForm(activeType.value);
    await refreshNuxtData();
    closeModal();
  } catch (error) {
    toast.add({
      title: 'Save failed',
      description: errorMessage(error),
      color: 'error',
    });
  } finally {
    saving.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    closeModal();
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm(activeType.value);
    }
  },
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="closeModal"
    >
      <section
        class="health-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-entry-title"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Quick entry
            </div>
            <h2
              id="quick-entry-title"
              class="health-modal-title"
            >
              Quick entry
            </h2>
            <p class="health-modal-lead">
              Choose an entry type and send it straight to the local database.
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close quick entry modal"
            @click="closeModal"
          >
            ×
          </button>
        </header>

        <div class="health-modal-switcher">
          <button
            v-for="type in entryTypes"
            :key="type.id"
            type="button"
            class="health-modal-tab"
            :data-active="activeType === type.id"
            @click="activeType = type.id"
          >
            <span>{{ type.label }}</span>
            <small>{{ type.description }}</small>
          </button>
        </div>

        <form
          class="health-modal-body"
          @submit.prevent="submit"
        >
          <div
            v-if="activeType === 'glucose'"
            class="health-form-grid"
          >
            <label class="health-field">
              <span>Date and time</span>
              <input
                v-model="form.glucose.measuredAt"
                type="datetime-local"
                class="health-input"
              >
            </label>
            <div class="health-field-grid">
              <label class="health-field">
                <span>Fasting</span>
                <input
                  v-model="form.glucose.fastingValue"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="5.6"
                  class="health-input"
                >
              </label>
              <label class="health-field">
                <span>After meal</span>
                <input
                  v-model="form.glucose.afterMealValue"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="7.8"
                  class="health-input"
                >
              </label>
            </div>
            <label class="health-field">
              <span>Note</span>
              <textarea
                v-model="form.glucose.note"
                rows="3"
                class="health-textarea"
                placeholder="For example: morning reading"
              />
            </label>
          </div>

          <div
            v-else-if="activeType === 'bloodPressure'"
            class="health-form-grid"
          >
            <label class="health-field">
              <span>Date and time</span>
              <input
                v-model="form.bloodPressure.measuredAt"
                type="datetime-local"
                class="health-input"
              >
            </label>
            <div class="health-field-grid health-field-grid-3">
              <label class="health-field">
                <span>Systolic</span>
                <input
                  v-model="form.bloodPressure.systolic"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="128"
                  class="health-input"
                >
              </label>
              <label class="health-field">
                <span>Diastolic</span>
                <input
                  v-model="form.bloodPressure.diastolic"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="82"
                  class="health-input"
                >
              </label>
              <label class="health-field">
                <span>Pulse</span>
                <input
                  v-model="form.bloodPressure.pulse"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="72"
                  class="health-input"
                >
              </label>
            </div>
            <label class="health-field">
              <span>Note</span>
              <textarea
                v-model="form.bloodPressure.note"
                rows="3"
                class="health-textarea"
                placeholder="For example: after a walk"
              />
            </label>
          </div>

          <div
            v-else-if="activeType === 'weight'"
            class="health-form-grid"
          >
            <label class="health-field">
              <span>Date and time</span>
              <input
                v-model="form.weight.measuredAt"
                type="datetime-local"
                class="health-input"
              >
            </label>
            <label class="health-field">
              <span>Weight, kg</span>
              <input
                v-model="form.weight.value"
                type="number"
                step="0.1"
                min="0"
                placeholder="91.4"
                class="health-input"
              >
            </label>
            <label class="health-field">
              <span>Note</span>
              <textarea
                v-model="form.weight.note"
                rows="3"
                class="health-textarea"
                placeholder="For example: morning reading"
              />
            </label>
          </div>

          <div
            v-else
            class="health-form-grid"
          >
            <label class="health-field">
              <span>Date and time</span>
              <input
                v-model="form.symptom.happenedAt"
                type="datetime-local"
                class="health-input"
              >
            </label>
            <div class="health-field-grid">
              <label class="health-field">
                <span>Symptom</span>
                <select
                  v-model="form.symptom.type"
                  class="health-input"
                >
                  <option
                    v-for="option in SYMPTOM_OPTIONS"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>
              <label class="health-field">
                <span>Intensity</span>
                <input
                  v-model="form.symptom.intensity"
                  type="number"
                  step="1"
                  min="0"
                  max="10"
                  placeholder="6"
                  class="health-input"
                >
              </label>
            </div>
            <label class="health-field">
              <span>Note</span>
              <textarea
                v-model="form.symptom.note"
                rows="3"
                class="health-textarea"
                placeholder="For example: after dinner"
              />
            </label>
          </div>

          <footer class="health-modal-actions">
            <p class="health-form-note">
              The entry will be saved without the ignored flag if the data looks
              valid.
            </p>

            <div class="health-modal-buttons">
              <button
                type="button"
                class="health-button health-button-secondary"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="health-button"
                :disabled="saving"
              >
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>
