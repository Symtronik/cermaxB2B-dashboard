<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

definePageMeta({
  layout: 'auth'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBaseUrl.replace(/\/+$/, '')

const email = ref('')
const loading = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// ✅ stan „wysyłamy…”
const infoMessage = computed(() =>
  loading.value ? t('auth.sending_reset_link') : null
)

const submit = async () => {
  errorMessage.value = null
  successMessage.value = null

  if (!email.value) {
    errorMessage.value = t('auth.provide_email')
    return
  }

  try {
    loading.value = true

    await $fetch(`${API_BASE}/password/forgot`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: { email: email.value }
    })

    successMessage.value = t('auth.reset_link_sent')
    email.value = ''
  } catch (e: any) {
    errorMessage.value = e?.data?.message || t('auth.reset_error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard class="w-full max-w-md shadow-lg/50">
    <template #header>
      <div class="flex items-center gap-3">
        <img src="/favicon.png" alt="Cermax" class="h-6 w-6 rounded" />
        <div>
          <h2 class="text-lg font-semibold leading-tight">
            {{ t('auth.forgot_password') }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ t('auth.forgot_password_subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="submit">
      <UFormField :label="t('auth.email')" name="email">
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          :placeholder="t('auth.email_placeholder')"
          class="w-full"
          :disabled="loading || !!successMessage"
        />
      </UFormField>

      <!-- 🟡 Info: wysyłanie -->
      <UAlert
        v-if="infoMessage"
        :description="infoMessage"
        color="blue"
        variant="soft"
      />

      <!-- 🟢 Sukces -->
      <UAlert
        v-if="successMessage"
        :title="t('auth.done')"
        :description="successMessage"
        color="green"
        variant="soft"
      />

      <!-- 🔴 Błąd -->
      <UAlert
        v-if="errorMessage"
        :title="t('auth.reset_error_title')"
        :description="errorMessage"
        color="red"
        variant="soft"
      />

      <UButton
        type="submit"
        :loading="loading"
        block
        size="lg"
        class="mt-2"
        :disabled="loading || !!successMessage"
      >
        {{ t('auth.send_reset_link') }}
      </UButton>

      <div class="mt-4 flex justify-end text-sm">
        <ULink to="/" class="underline hover:no-underline">
          {{ t('auth.back_to_login') }}
        </ULink>
      </div>
    </form>
  </UCard>
</template>
