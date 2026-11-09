<script setup lang="ts">
import { applySession, consumeGoogleCallback, googleErrorMessage } from '~/lib/api/auth';

const toast = useToast();
const message = ref('Signing in…');

useHead({ title: 'Signing in · Health Monitor' });

onMounted(async () => {
  const result = consumeGoogleCallback();

  if (result.kind === 'token') {
    applySession(result.token, '/');
    return;
  }

  // A failed or foreign result never touches the current session.
  message.value = result.kind === 'error'
    ? googleErrorMessage(result.code)
    : 'Sign-in could not be completed, please try again.';

  toast.add({
    title: message.value,
    color: result.kind === 'error' && result.code === 'access_denied' ? 'neutral' : 'error',
  });

  await navigateTo('/', { replace: true });
});
</script>

<template>
  <HealthShell>
    <section class="health-panel health-auth-callback-card">
      <div class="health-eyebrow">
        Google sign-in
      </div>
      <p class="health-lead">
        {{ message }}
      </p>
    </section>
  </HealthShell>
</template>
