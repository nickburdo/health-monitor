<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
}>();
</script>

<template>
  <section class="health-page-grid">
    <div class="health-panel health-page-card">
      <HealthPageHeaderWithFilter
        :eyebrow="eyebrow"
        :title="title"
      >
        <template #default>
          <slot name="filter" />
        </template>
      </HealthPageHeaderWithFilter>
    </div>

    <slot />
  </section>
</template>
