<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()
const config = useRuntimeConfig()

type LoginResponse = {
  message: string
  token?: string
  access_token?: string
  user?: {
    id: number
    name: string
    email: string
    roles: string[]
  }
}

const form = reactive({ email: '', password: '', remember: false })
const errors = reactive<{ email?: string; password?: string; general?: string }>({})
const pending = ref(false)
const showPassword = ref(false)

const API_BASE = (config.public.apiBaseUrl).replace(/\/+$/, '')

function validate() {
  errors.email = ''
  errors.password = ''

  if (!form.email) errors.email = t('auth.email_required')
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = t('auth.email_invalid')

  if (!form.password) errors.password = t('auth.password_required')

  return !errors.email && !errors.password
}

async function onSubmit() {
  errors.general = ''
  if (!validate()) return
  pending.value = true

  try {
    const res = await $fetch<LoginResponse>(`http://localhost:8000/api/user/login`, {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: {
        email: form.email.trim(),
        password: form.password
      }
    })

    const token = res.token ?? res.access_token
    if (!token) throw new Error('No token in response')

    // Cookie SSR-safe; przy "remember" ustawiamy dłuższy czas życia
    const tokenCookie = useCookie<string | null>('auth_token', {
      maxAge: form.remember ? 60 * 60 * 24 * 30 : undefined, // 30 dni
      sameSite: 'lax',
      secure: process.client && location.protocol === 'http:',
      path: '/'
    })
    tokenCookie.value = token

    // Opcjonalnie także localStorage — tylko w przeglądarce
    if (process.client && form.remember) {
      localStorage.setItem('auth_token', token)
    }

    await router.push('/dashboard')
  } catch (e: any) {
    // Laravel 422/401/500
    const msg =
      e?.data?.message ||
      e?.data?.errors?.email?.[0] ||
      e?.data?.errors?.password?.[0] ||
      e?.message ||
      t('auth.login_failed')
    errors.general = String(msg)

    // dla bezpieczeństwa czyść hasło przy błędzie
    form.password = ''
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <NuxtLayout name="auth">
    <UCard class="w-full max-w-md shadow-lg/50">
      <!-- Header karty -->
      <template #header>
        <div class="flex items-center gap-3">
          <img src="/favicon.png" alt="Cermax" class="h-6 w-6 rounded" />
          <div>
            <h2 class="text-lg font-semibold leading-tight">
              {{ t('auth.sign_in_to_account') }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ t('auth.panel_subtitle') }}
            </p>
          </div>
        </div>
      </template>

      <!-- Formularz -->
      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField :label="t('auth.email')" name="email" :help="errors.email" :error="!!errors.email">
          <UInput
            v-model="form.email"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.email_placeholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.password')" name="password" :help="errors.password" :error="!!errors.password">
          <div class="relative">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :placeholder="t('auth.password_placeholder')"
              class="w-full pr-10"
            />
            <!-- toggle widoczności hasła -->
            <button
              type="button"
              class="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
              @click="showPassword = !showPassword"
              aria-label="Toggle password visibility"
            >
              <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="h-5 w-5" />
            </button>
          </div>
        </UFormField>

        <div class="flex items-center justify-between">
          <label class="inline-flex items-center gap-2">
            <UCheckbox v-model="form.remember" />
            <span class="text-sm">{{ t('auth.remember_me') }}</span>
          </label>
          <ULink to="/auth/forgot" class="text-sm underline hover:no-underline">
            {{ t('auth.forgot_password') }}
          </ULink>
        </div>

        <UAlert
          v-if="errors.general"
          :title="t('auth.login_failed')"
          :description="errors.general"
          color="red"
          variant="soft"
        />

        <UButton type="submit" :loading="pending" block size="lg" class="mt-2">
          {{ t('auth.sign_in') }}
        </UButton>
      </form>

      <!-- Stopka karty -->
      <template #footer>
        <div class="flex flex-col items-center gap-3">
          <UDivider />
          <p class="text-sm text-center text-gray-600">
            {{ t('auth.no_account') }}
            <ULink to="/auth/register" class="underline hover:no-underline">
              {{ t('auth.create_account') }}
            </ULink>
          </p>
        </div>
      </template>
    </UCard>
  </NuxtLayout>
  <Footer />
</template>
