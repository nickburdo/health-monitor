<script setup lang="ts">
defineProps<{
  title: string;
  items: Array<{
    title: string;
    subtitle: string;
    ignored?: boolean;
  }>;
}>();
</script>

<template>
  <article class="health-panel health-list">
    <h2 class="health-section-title">
      {{ title }}
    </h2>
    <div class="health-list-items">
      <div
        v-for="item in items"
        :key="`${item.title}-${item.subtitle}`"
        class="health-list-row"
        :data-ignored="item.ignored ? 'true' : 'false'"
      >
        <div>
          <strong>{{ item.title }}</strong>
          <span>{{ item.subtitle }}</span>
        </div>
      </div>
    </div>
  </article>
</template>
