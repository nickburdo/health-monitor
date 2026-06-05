<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  unit?: string;
  tone: 'glucose' | 'pressure' | 'weight' | 'symptoms';
}>();
</script>

<template>
  <article class="health-metric">
    <div class="health-metric-top">
      <span>{{ label }}</span>
      <span
        :class="['health-dot', tone]"
        aria-hidden="true"
      />
    </div>
    <div class="health-value">
      {{ value }}
      <span
        v-if="unit"
        class="health-unit"
      >{{ unit }}</span>
    </div>
  </article>
</template>
