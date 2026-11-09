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

// Unknown routes (e.g. 404) show a neutral trigger instead of a wrong page
const fallbackPage = { label: 'Menu', path: '', icon: 'i-lucide-menu' };

function isActive(path: string) {
  // Treat "/glucose/" the same as "/glucose"
  const currentPath = route.path.length > 1 ? route.path.replace(/\/+$/, '') : route.path;

  return currentPath === path;
}

const currentPage = computed(
  () => navigation.find(item => isActive(item.path)) ?? fallbackPage,
);

const navItems = computed(() =>
  navigation.map(item => ({
    label: item.label,
    icon: item.icon,
    to: item.path,
    class: isActive(item.path) ? 'health-nav-menu-item is-active' : 'health-nav-menu-item',
  })),
);
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
          <UDropdownMenu
            :items="navItems"
            :content="{ align: 'start', sideOffset: 8 }"
            :ui="{ content: 'health-nav-menu', itemLeadingIcon: 'health-nav-menu-icon' }"
          >
            <button
              type="button"
              class="health-nav-trigger"
            >
              <UIcon
                :name="currentPage.icon"
                class="nav-icon"
                aria-hidden="true"
              />
              <span>{{ currentPage.label }}</span>
              <UIcon
                name="i-lucide-chevron-down"
                class="nav-icon health-nav-chevron"
                aria-hidden="true"
              />
            </button>
          </UDropdownMenu>
        </nav>

        <div class="health-actions">
          <ThemeToggle />
          <button
            type="button"
            class="health-button"
            @click="quickEntryOpen = true"
          >
            + Add entry
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
      @entry-created="() => reloadNuxtApp({ persistState: false, path: route.path })"
    />

    <ConfirmDialog />

    <nav
      class="health-footer"
      aria-label="Mobile navigation"
    >
      <div class="health-footer-inner">
        <NuxtLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          :data-active="isActive(item.path)"
          :aria-label="item.label"
          :title="item.label"
        >
          <UIcon
            :name="item.icon"
            class="nav-icon"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style>
.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
