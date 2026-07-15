<script setup lang="ts">
import {
  downloadHealthMonitorExport,
  exportHealthMonitorData,
  importHealthMonitorData,
} from '~/lib/db/export-import';

const emit = defineEmits<{
  imported: [];
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);

async function exportData() {
  const exportData = await exportHealthMonitorData();
  downloadHealthMonitorExport(exportData);
}

function openImportDialog() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const confirmed = window.confirm(
    'Importing will replace all local data with the contents of this file. Continue?',
  );

  if (!confirmed) {
    input.value = '';
    return;
  }

  try {
    importing.value = true;
    await importHealthMonitorData(file);

    toast.add({
      title: 'Import complete',
      description: 'The local database was replaced with the imported file.',
    });

    emit('imported');
  } catch (error) {
    toast.add({
      title: 'Import failed',
      description: error instanceof Error ? error.message : 'Could not import the file',
      color: 'error',
    });
  } finally {
    importing.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div class="health-dashboard-data-actions">
    <button
      type="button"
      class="health-button health-button-secondary health-button-small"
      @click="exportData"
    >
      Export JSON
    </button>
    <button
      type="button"
      class="health-button health-button-secondary health-button-small"
      :disabled="importing"
      @click="openImportDialog"
    >
      {{ importing ? 'Importing…' : 'Import JSON' }}
    </button>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      class="sr-only"
      @change="handleFileChange"
    >
  </div>
</template>
