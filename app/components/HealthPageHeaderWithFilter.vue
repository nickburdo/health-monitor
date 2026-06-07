<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
}>();
</script>

<template>
  <div class="health-page-header-with-filter">
    <div class="health-page-header-copy">
      <div class="health-eyebrow">
        {{ eyebrow }}
      </div>
      <h1 class="health-page-title">
        {{ title }}
      </h1>
    </div>

    <div class="health-page-header-filter">
      <slot />
    </div>
  </div>
</template>
