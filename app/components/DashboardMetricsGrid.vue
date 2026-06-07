<script setup lang="ts">
defineProps<{
  glucoseDetails: string;
  glucoseValue: string;
  pressureDetails: string;
  pressureValue: string;
  weightDetails: string;
  weightValue: string;
  symptomDetails: string;
  symptomValue: string;
}>();
</script>

<template>
  <section class="health-meta-grid">
    <HealthMetricCard
      label="Glucose"
      tone="glucose"
      :value="glucoseValue"
      unit="mmol/L"
      :details="glucoseDetails"
    />
    <HealthMetricCard
      label="Pressure"
      tone="pressure"
      :value="pressureValue"
      :details="pressureDetails"
    />
    <HealthMetricCard
      label="Weight"
      tone="weight"
      :value="weightValue"
      unit="kg"
      :details="weightDetails"
    />
    <HealthMetricCard
      label="Symptoms"
      tone="symptoms"
      :value="symptomValue"
      unit="entries"
      :details="symptomDetails"
    />
  </section>
</template>
