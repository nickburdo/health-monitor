<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { logout } from '~/lib/api/auth';

const route = useRoute();
const { isGuest, user, guestPromptOpen, deleteAccountOpen, openAuthModal } = useAuth();

const quickEntryOpen = ref(false);

// Guests cannot write: Add entry explains that and offers sign-in instead.
function openQuickEntry() {
  if (isGuest.value) {
    guestPromptOpen.value = true;
    return;
  }

  quickEntryOpen.value = true;
}

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

// The user object may be missing when /auth/me failed on a network error.
const accountLabel = computed(() => user.value?.username ?? 'Account');

const accountItems = computed(() => [
  [
    {
      label: `Signed in as ${accountLabel.value}`,
      type: 'label' as const,
      class: 'health-account-menu-label',
    },
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      class: 'health-nav-menu-item',
      onSelect: logout,
    },
    {
      label: 'Delete account',
      icon: 'i-lucide-trash-2',
      class: 'health-nav-menu-item health-account-menu-danger',
      // Confirmation needs the username, so it stays disabled until /auth/me has loaded.
      disabled: !user.value,
      onSelect: () => {
        deleteRequested = true;
      },
    },
  ],
]);

// While open, the menu traps focus, and on close it moves focus back to its trigger.
// So the delete dialog opens only after the menu has closed (closeAutoFocus fires after
// its exit animation); cancelling the event lets the dialog keep focus on its input.
let deleteRequested = false;

function handleAccountMenuCloseAutoFocus(event: Event) {
  if (deleteRequested) {
    deleteRequested = false;
    event.preventDefault();
    deleteAccountOpen.value = true;
  }
}

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
            @click="openQuickEntry"
          >
            + Add entry
          </button>

          <button
            v-if="isGuest"
            type="button"
            class="health-button health-button-secondary health-account-trigger"
            @click="openAuthModal('signIn')"
          >
            <UIcon
              name="i-lucide-log-in"
              class="nav-icon"
              aria-hidden="true"
            />
            <span class="health-account-trigger-label">Sign in</span>
          </button>

          <UDropdownMenu
            v-else
            :items="accountItems"
            :content="{ align: 'end', sideOffset: 8, onCloseAutoFocus: handleAccountMenuCloseAutoFocus }"
            :ui="{ content: 'health-nav-menu', itemLeadingIcon: 'health-nav-menu-icon' }"
          >
            <button
              type="button"
              class="health-button health-button-secondary health-account-trigger"
              :aria-label="`Account menu for ${accountLabel}`"
            >
              <UIcon
                name="i-lucide-user"
                class="nav-icon"
                aria-hidden="true"
              />
              <span class="health-account-trigger-label">{{ accountLabel }}</span>
            </button>
          </UDropdownMenu>
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
    <AuthModal />
    <GuestPrompt />
    <DeleteAccountDialog />

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
