<script setup lang="ts">
const route = useRoute();
const quickEntryOpen = ref(false);

const navigation = [
  { label: 'Dashboard', path: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Glucose', path: '/glucose', icon: 'i-lucide-droplet' },
  { label: 'Pressure', path: '/blood-pressure', icon: 'i-lucide-heart-pulse' },
  { label: 'Weight', path: '/weight', icon: 'i-lucide-scale' },
  { label: 'Symptoms', path: '/symptoms', icon: 'i-lucide-clipboard-list' },
];

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
      <div class="health-header-inner">
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
            <UIcon :name="item.icon" class="nav-icon nav-icon-large" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="health-actions">
          <button
            type="button"
            class="health-button"
            @click="quickEntryOpen = true"
          >
            + Add Entry
          </button>
        </div>
      </div>
    </header>

    <main class="health-shell">
      <slot />
    </main>

    <HealthQuickEntryModal
      :open="quickEntryOpen"
      @close="quickEntryOpen = false"
    />

    <footer
      class="health-footer"
      aria-label="Mobile navigation"
    >
      <div class="health-footer-inner">
        <NuxtLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          :data-active="isActive(item.path)"
        >
          <UIcon :name="item.icon" class="nav-icon" />
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style>
.nav-icon-large {
  width: 22px !important;
  height: 22px !important;
}
.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
