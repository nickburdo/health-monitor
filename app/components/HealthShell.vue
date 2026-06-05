<script setup lang="ts">
const route = useRoute();
const toast = useToast();

const navigation = [
  { label: 'Dashboard', path: '/', icon: '⌂' },
  { label: 'Glucose', path: '/glucose', icon: '◌' },
  { label: 'Pressure', path: '/blood-pressure', icon: '♥' },
  { label: 'Weight', path: '/weight', icon: '⚖' },
  { label: 'Symptoms', path: '/symptoms', icon: '⋯' },
];

function notifyQuickEntry() {
  toast.add({
    title: 'Quick entry',
    description: 'Form stage comes next. Shell ready.',
  });
}

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/';
  }

  return route.path === path;
}
</script>

<template>
  <div class="health-app">
    <header class="health-header">
      <NuxtLink
        to="/"
        class="health-brand"
      >
        <span class="health-mark">HM</span>
        <span>Health Monitor</span>
      </NuxtLink>

      <nav
        class="health-nav"
        aria-label="Main navigation"
      >
        <NuxtLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          :data-active="isActive(item.path)"
        >
          <span aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="health-actions">
        <button
          type="button"
          class="health-button"
          @click="notifyQuickEntry"
        >
          + Add Entry
        </button>
      </div>
    </header>

    <main class="health-shell">
      <slot />
    </main>

    <footer
      class="health-footer"
      aria-label="Mobile navigation"
    >
      <NuxtLink
        v-for="item in navigation"
        :key="item.path"
        :to="item.path"
        :data-active="isActive(item.path)"
      >
        <span aria-hidden="true">{{ item.icon }}</span>
      </NuxtLink>
    </footer>
  </div>
</template>
