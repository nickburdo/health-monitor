<script setup lang="ts">
defineProps<{
  bars: Array<{ height: number }>;
}>();
</script>

<template>
  <div
    class="health-trend"
    aria-label="Trend chart"
  >
    <div
      v-for="(bar, index) in bars"
      :key="`${index}-${bar.height}`"
      class="health-bar"
      :style="{ height: `${bar.height}%` }"
    />
  </div>
</template>
