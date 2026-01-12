<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const token = route.query.token as string | undefined
const email = route.query.email as string | undefined

const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

if (!token || !email) {
  errorMessage.value = t('auth.invalid_reset_link')
}

type ResetResponse = {
  message?: string
  redirect?: string
}

const submit = async () => {
  if (!token || !email) return

  errorMessage.value = null

  if (password.value.length < 8) {
    errorMessage.value = t('auth.password_min')
    return
  }

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = t('auth.passwords_not_match')
    return
  }

  try {
    loading.value = true

    // ✅ jeśli baseUrl masz bez /api: http://localhost:8000
    const res = await $fetch<ResetResponse>(`${config.public.apiBaseUrl}/password/reset`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: {
        token,
        email,
        password: password.value,
        password_confirmation: passwordConfirmation.value
      }
    })

    successMessage.value = t('auth.password_reset_success')

    // ✅ backend zwraca redirect (np. http://localhost:3000/)
    const redirectTo = res?.redirect || 'http://localhost:3000/'

    setTimeout(() => {
      window.location.href = redirectTo
    }, 800)
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
            {{ t('auth.reset_password') }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ t('auth.reset_password_subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="submit">
      <UFormField :label="t('auth.new_password')">
        <UInput
          v-model="password"
          type="password"
          autocomplete="new-password"
          class="w-full"
          :disabled="loading || !!successMessage"
        />
      </UFormField>

      <UFormField :label="t('auth.confirm_password')">
        <UInput
          v-model="passwordConfirmation"
          type="password"
          autocomplete="new-password"
          class="w-full"
          :disabled="loading || !!successMessage"
        />
      </UFormField>

      <!-- 🔴 Błąd -->
      <UAlert
        v-if="errorMessage"
        :title="t('auth.reset_error_title')"
        :description="errorMessage"
        color="red"
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

      <UButton
        type="submit"
        :loading="loading"
        block
        size="lg"
        class="mt-2"
        :disabled="loading || !!successMessage"
      >
        {{ t('auth.reset_password_action') }}
      </UButton>

      <div class="mt-4 flex justify-end text-sm">
        <ULink to="/" class="underline hover:no-underline">
          {{ t('auth.back_to_login') }}
        </ULink>
      </div>
    </form>
  </UCard>
</template>

