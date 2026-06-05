<script setup lang="ts">
useHead({
  title: 'Health Monitor',
});

useSeoMeta({
  title: 'Health Monitor',
  description: 'Personal health tracking app',
});
</script>

<template>
  <UContainer class="flex min-h-screen items-center justify-center py-16">
    <UCard class="w-full max-w-xl">
      <div class="space-y-4">
        <p class="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Health Monitor
        </p>

        <div class="space-y-2">
          <h1 class="text-3xl font-semibold tracking-tight">
            Project scaffold ready
          </h1>
          <p class="text-muted">
            Nuxt 4, Nuxt UI, Tailwind, ESLint, Prettier and TypeScript are set
            up. Next step is the app structure.
          </p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
