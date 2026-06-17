<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const supabase = useSupabaseClient();
const toast = useToast();

const form = reactive({
  email: '',
  password: '',
});

const submitting = ref(false);
const oauthSubmitting = ref(false);

function closeModal() {
  if (submitting.value || oauthSubmitting.value) {
    return;
  }

  form.email = '';
  form.password = '';
  emit('close');
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Не удалось выполнить вход';
}

async function submit() {
  if (submitting.value) {
    return;
  }

  try {
    submitting.value = true;

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      throw error;
    }

    form.email = '';
    form.password = '';
    emit('close');

    await refreshNuxtData();

    toast.add({
      title: 'Вход выполнен',
      description: 'Данные обновлены для текущей сессии.',
    });
  } catch (error) {
    toast.add({
      title: 'Не удалось войти',
      description: errorMessage(error),
      color: 'error',
    });
  } finally {
    submitting.value = false;
  }
}

async function signInWithGoogle() {
  if (submitting.value || oauthSubmitting.value) {
    return;
  }

  try {
    oauthSubmitting.value = true;

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    oauthSubmitting.value = false;

    toast.add({
      title: 'Не удалось войти через Google',
      description: errorMessage(error),
      color: 'error',
    });
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    closeModal();
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      form.email = '';
      form.password = '';
    }
  },
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="health-modal-backdrop"
      role="presentation"
      @click.self="closeModal"
    >
      <section
        class="health-modal health-auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <header class="health-modal-header">
          <div>
            <div class="health-eyebrow">
              Admin access
            </div>
            <h2
              id="auth-modal-title"
              class="health-modal-title"
            >
              Sign In
            </h2>
            <p class="health-modal-lead">
              Войдите через email и пароль Supabase, чтобы открыть приватный режим.
            </p>
          </div>

          <button
            type="button"
            class="health-modal-close"
            aria-label="Close sign in modal"
            @click="closeModal"
          >
            ×
          </button>
        </header>

        <form
          class="health-modal-body"
          @submit.prevent="submit"
        >
          <div class="health-form-grid">
            <label class="health-field">
              <span>Email</span>
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="health-input"
              >
            </label>

            <label class="health-field">
              <span>Password</span>
              <input
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                class="health-input"
              >
            </label>
          </div>

          <div class="health-auth-divider">
            <span>или</span>
          </div>

          <button
            type="button"
            class="health-button health-button-secondary health-auth-google-button"
            :disabled="submitting || oauthSubmitting"
            @click="signInWithGoogle"
          >
            {{ oauthSubmitting ? 'Переход к Google…' : 'Continue with Google' }}
          </button>

          <footer class="health-modal-actions">
            <p class="health-form-note">
              Без дополнительной валидации. Ошибки входа показываются через toast.
            </p>

            <div class="health-modal-buttons">
              <button
                type="button"
                class="health-button health-button-secondary"
                @click="closeModal"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="health-button"
                :disabled="submitting"
              >
                {{ submitting ? 'Вход…' : 'Sign In' }}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>
