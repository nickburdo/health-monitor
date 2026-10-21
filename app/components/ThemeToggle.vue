<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === 'dark');
const label = computed(() => (isDark.value ? 'Switch to light theme' : 'Switch to dark theme'));

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark';
}
</script>

<template>
  <button
    type="button"
    class="health-icon-button"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <UIcon
      :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
      class="nav-icon"
    />
  </button>
</template>
