<script setup lang="ts">
import {
  createPresetPeriodFilters,
  endOfDayIso,
  formatPeriodShortDate,
  startOfDayIso,
  toDateInputValue,
  type PeriodFilterValue,
  type PeriodPreset,
} from '~/composables/usePeriodFilter';

const props = defineProps<{
  modelValue: PeriodFilterValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PeriodFilterValue];
}>();

const customDialogOpen = ref(false);
const customDateFrom = ref('');
const customDateTo = ref('');

const periodButtons: Array<{
  preset: PeriodPreset;
  label: string;
}> = [
  { preset: '3m', label: '3 месяца' },
  { preset: '6m', label: '6 месяцев' },
  { preset: 'ytd', label: 'С начала года' },
  { preset: 'custom', label: 'Выбрать' },
];

function emitValue(value: PeriodFilterValue) {
  emit('update:modelValue', value);
}

function openCustomDialog() {
  customDateFrom.value = toDateInputValue(props.modelValue.dateFrom);
  customDateTo.value = toDateInputValue(props.modelValue.dateTo);
  customDialogOpen.value = true;
}

function closeCustomDialog() {
  customDialogOpen.value = false;
}

function applyPreset(preset: PeriodPreset) {
  if (preset === 'custom') {
    openCustomDialog();
    return;
  }

  emitValue(createPresetPeriodFilters(preset));
}

function applyCustomRange() {
  if (!customDateFrom.value || !customDateTo.value) {
    return;
  }

  const from = new Date(`${customDateFrom.value}T00:00:00`);
  const to = new Date(`${customDateTo.value}T23:59:59.999`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return;
  }

  emitValue({
    preset: 'custom',
    dateFrom: startOfDayIso(from),
    dateTo: endOfDayIso(to),
  });
  closeCustomDialog();
}

function cancelCustomRange() {
  closeCustomDialog();
}

const customButtonLabel = computed(() => {
  if (props.modelValue.preset !== 'custom') {
    return 'Выбрать';
  }

  const from = formatPeriodShortDate(props.modelValue.dateFrom);
  const to = formatPeriodShortDate(props.modelValue.dateTo);

  return from && to ? `${from} - ${to}` : 'Выбрать';
});

const selectedCustomRange = computed(() => {
  const from = formatPeriodShortDate(props.modelValue.dateFrom);
  const to = formatPeriodShortDate(props.modelValue.dateTo);

  return from && to ? `${from} - ${to}` : 'Произвольный диапазон';
});

watch(
  () => props.modelValue,
  (value) => {
    if (value.preset !== 'custom') {
      customDialogOpen.value = false;
    }
  },
  { deep: true },
);
</script>

<template>
  <button
    v-for="button in periodButtons"
    :key="button.preset"
    type="button"
    class="health-pill health-period-filter-button"
    :data-active="modelValue.preset === button.preset"
    @click="applyPreset(button.preset)"
  >
    <span v-if="button.preset !== 'custom'">
      {{ button.label }}
    </span>
    <span v-else>
      {{ customButtonLabel }}
    </span>
  </button>

  <Teleport to="body">
    <div
      v-if="customDialogOpen"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="closeCustomDialog"
    >
      <section
        class="health-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="period-filter-title"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Period filter
            </div>
            <h2
              id="period-filter-title"
              class="health-modal-title"
            >
              Выбор периода
            </h2>
            <p class="health-modal-lead">
              {{ selectedCustomRange }}
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close custom period dialog"
            @click="closeCustomDialog"
          >
            ×
          </button>
        </header>

        <div class="health-field-grid health-period-filter-custom-fields">
          <label class="health-field">
            <span>Дата начала</span>
            <input
              v-model="customDateFrom"
              type="date"
              class="health-input"
            >
          </label>

          <label class="health-field">
            <span>Дата окончания</span>
            <input
              v-model="customDateTo"
              type="date"
              class="health-input"
            >
          </label>
        </div>

        <footer class="health-modal-actions">
          <p class="health-form-note">
            Выберите диапазон и примените его к списку веса.
          </p>

          <div class="health-modal-buttons">
            <button
              type="button"
              class="health-button health-button-secondary health-button-small"
              @click="cancelCustomRange"
            >
              Отмена
            </button>
            <button
              type="button"
              class="health-button health-button-small"
              :disabled="!customDateFrom || !customDateTo || customDateFrom > customDateTo"
              @click="applyCustomRange"
            >
              Применить
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
