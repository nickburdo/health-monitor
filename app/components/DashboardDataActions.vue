<script setup lang="ts">
import {
  downloadHealthMonitorExport,
  exportHealthMonitorData,
  importHealthMonitorData,
} from '~/lib/db/export-import';
import { clearHealthMonitorData, replaceWithDemoData } from '~/lib/db/seed';

const emit = defineEmits<{
  changed: [];
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);
// Shared lock: import, demo load and clear all replace the whole database.
const busy = ref(false);

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
    busy.value = true;
    await importHealthMonitorData(file);

    toast.add({
      title: 'Import complete',
      description: 'The local database was replaced with the imported file.',
    });

    emit('changed');
  } catch (error) {
    toast.add({
      title: 'Import failed',
      description: error instanceof Error ? error.message : 'Could not import the file',
      color: 'error',
    });
  } finally {
    importing.value = false;
    busy.value = false;
    input.value = '';
  }
}

async function loadDemoData() {
  const confirmed = window.confirm(
    'Loading demo data will replace all local data. Continue?',
  );

  if (!confirmed) {
    return;
  }

  try {
    busy.value = true;
    await replaceWithDemoData();

    toast.add({ title: 'Demo data loaded' });

    emit('changed');
  } catch (error) {
    toast.add({
      title: 'Could not load demo data',
      description: error instanceof Error ? error.message : 'Unknown error',
      color: 'error',
    });
  } finally {
    busy.value = false;
  }
}

async function clearData() {
  const confirmed = window.confirm(
    'This will permanently delete all local data. Continue?',
  );

  if (!confirmed) {
    return;
  }

  try {
    busy.value = true;
    await clearHealthMonitorData();

    toast.add({ title: 'Database cleared' });

    emit('changed');
  } catch (error) {
    toast.add({
      title: 'Could not clear the database',
      description: error instanceof Error ? error.message : 'Unknown error',
      color: 'error',
    });
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="health-dashboard-data-actions">
    <div class="health-dashboard-data-actions-group">
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
        :disabled="busy"
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
    <div class="health-dashboard-data-actions-group">
      <button
        type="button"
        class="health-button health-button-secondary health-button-small"
        :disabled="busy"
        @click="loadDemoData"
      >
        Load demo data
      </button>
      <button
        type="button"
        class="health-button health-button-secondary health-button-small"
        :disabled="busy"
        @click="clearData"
      >
        Clear database
      </button>
    </div>
  </div>
</template>
