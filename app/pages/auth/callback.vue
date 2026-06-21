<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const session = useSupabaseSession();
const toast = useToast();

const status = ref<'loading' | 'error'>('loading');
const message = ref('Completing Google sign-in...');

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message;

    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not complete Google sign-in';
}

async function waitForSession(timeoutMs = 2000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (session.value) {
      return session.value;
    }

    const { data } = await supabase.auth.getSession();

    if (data.session) {
      return data.session;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return null;
}

onMounted(async () => {
  try {
    const code = typeof route.query.code === 'string' ? route.query.code : '';

    let currentSession = await waitForSession();

    if (!currentSession && code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }

      currentSession = await waitForSession();
    }

    if (!currentSession) {
      throw new Error('Could not get an active Google session');
    }

    await refreshNuxtData();

    toast.add({
      title: 'Signed in',
      description: 'The Google session is active and the data was refreshed.',
    });

    await router.replace('/');
  } catch (error) {
    status.value = 'error';
    message.value = errorMessage(error);

    toast.add({
      title: 'Could not complete Google sign-in',
      description: message.value,
      color: 'error',
    });

    await router.replace('/');
  }
});

useHead({
  title: 'Auth Callback · Health Monitor',
});
</script>

<template>
  <main class="health-shell">
    <section class="health-panel health-page-card health-auth-callback-card">
      <div class="health-eyebrow">
        Google auth
      </div>
      <h1 class="health-page-title">
        {{ status === 'loading' ? 'Connecting session' : 'Authentication error' }}
      </h1>
      <p class="health-page-lead">
        {{ message }}
      </p>
    </section>
  </main>
</template>
