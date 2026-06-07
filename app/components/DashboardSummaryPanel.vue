<script setup lang="ts">
defineProps<{
  activeRecordCount: number;
  ignoredRecordCount: number;
  latestEntryTitle?: string;
  latestEntrySubtitle?: string;
}>();
</script>

<template>
  <aside class="health-panel health-panel-soft health-card health-dashboard-summary">
    <div class="health-dashboard-summary-list">
      <div class="health-dashboard-summary-row">
        <span>Активные записи</span>
        <strong>{{ activeRecordCount }}</strong>
      </div>
      <div class="health-dashboard-summary-row">
        <span>Игнорируемые записи</span>
        <strong>{{ ignoredRecordCount }}</strong>
      </div>
      <div class="health-dashboard-summary-row health-dashboard-summary-row-wide">
        <span>Последняя активность</span>
        <strong>{{ latestEntryTitle ?? '—' }}</strong>
        <small>{{ latestEntrySubtitle ?? 'Нет данных за период' }}</small>
      </div>
    </div>
  </aside>
</template>
