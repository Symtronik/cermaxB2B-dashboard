<script setup lang="ts">
import { computed, ref, watch } from 'vue'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const localePath = useLocalePath()

const config = useRuntimeConfig()
const API_BASE = config.public.apiBaseUrl.replace(/\/+$/, '')

const authToken = useCookie<string | null>('auth_token')

type ApiAdmin = {
  id: number
  name: string
  email: string
  roles: string[]
  created_at?: string | null
  last_login_at?: string | null
  is_active?: boolean
  blocked_at?: string | null

  // UI
  created_at_fmt?: string
  last_login_at_fmt?: string
}

type ApiResponse = {
  data: ApiAdmin[]
  current_page: number
  per_page: number
  total: number
}

// ===== state =====
const query = ref('')
const debouncedQuery = ref('')
const page = ref(1)
const perPage = ref(25)

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const admins = ref<ApiAdmin[]>([])
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

// ===== helpers =====
function roleLabel(roles: string[]) {
  if (roles.includes('super-admin')) return 'Super Admin'
  if (roles.includes('admin')) return 'Administrator'
  return '—'
}

function roleBadgeColor(roles: string[]) {
  if (roles.includes('super-admin')) return 'blue'
  if (roles.includes('admin')) return 'gray'
  return 'amber'
}

function isActive(a: ApiAdmin) {
  if (typeof a.is_active === 'boolean') return a.is_active
  return !a.blocked_at
}

function statusLabel(a: ApiAdmin) {
  return isActive(a) ? 'Aktywny' : 'Zablokowany'
}

function statusBadgeColor(a: ApiAdmin) {
  return isActive(a) ? 'green' : 'red'
}

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
}

function formatDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d)
}

// ===== fetch =====
async function fetchAdmins() {
  loading.value = true
  errorMessage.value = null

  try {
    if (!authToken.value) {
      admins.value = []
      total.value = 0
      errorMessage.value = 'Brak tokena logowania (auth_token). Zaloguj się ponownie.'
      return
    }

    const res = await $fetch<ApiResponse>(`${API_BASE}/admin/users`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken.value}`
      },
      query: {
        q: debouncedQuery.value || undefined,
        page: page.value,
        per_page: perPage.value
      }
    })

    admins.value = (res.data ?? []).map(a => ({
      ...a,
      created_at_fmt: formatDate(a.created_at),
      last_login_at_fmt: formatDateTime(a.last_login_at)
    }))

    total.value = res.total ?? 0
    page.value = res.current_page ?? page.value
    perPage.value = res.per_page ?? perPage.value

    if (page.value > totalPages.value) page.value = 1
  } catch (e: any) {
    admins.value = []
    total.value = 0

    if (e?.status === 401) errorMessage.value = '401: Unauthenticated (token nieprawidłowy / wygasł).'
    else if (e?.status === 403) errorMessage.value = '403: Brak uprawnień (wymagana rola super-admin).'
    else if (e?.status === 404) errorMessage.value = '404: Nie znaleziono endpointu (sprawdź czy API_BASE zawiera /api).'
    else errorMessage.value = e?.data?.message || 'Nie udało się pobrać listy administratorów.'
  } finally {
    loading.value = false
  }
}

// ===== debounce search =====
watch(query, (val) => {
  const v = (val ?? '').toString()
  const timer = setTimeout(() => {
    debouncedQuery.value = v
  }, 350)
  return () => clearTimeout(timer as any)
})

// reset strony przy zmianie query/perPage
watch([debouncedQuery, perPage], () => {
  page.value = 1
})

// fetch
watch([debouncedQuery, page, perPage], fetchAdmins, { immediate: true })
</script>

<template>
  <UPage>
    <div class="space-y-6">
      <!-- header -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">Administratorzy</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Lista użytkowników z rolą admin / super-admin.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton variant="soft" icon="i-lucide-refresh-cw" :loading="loading" @click="fetchAdmins">
            Odśwież
          </UButton>

          <UButton icon="i-lucide-plus" color="primary" :to="localePath({ name: 'dashboard-admins-new' })">
            Dodaj administratora
          </UButton>
        </div>
      </div>

      <!-- filters -->
      <UCard class="shadow-sm">
        <div class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div class="flex flex-col sm:flex-row gap-3 w-full">
            <UInput
              v-model="query"
              icon="i-lucide-search"
              placeholder="Szukaj: imię, email…"
              class="w-full"
            />

            <USelect
              v-model="perPage"
              :options="[
                { label: '10', value: 10 },
                { label: '25', value: 25 },
                { label: '50', value: 50 },
                { label: '100', value: 100 }
              ]"
              option-attribute="label"
              value-attribute="value"
              class="w-full sm:w-28"
            />
          </div>

          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Wyniki: <b class="text-gray-800 dark:text-gray-200">{{ total }}</b></span>
          </div>
        </div>
      </UCard>

      <UAlert v-if="errorMessage" color="red" variant="soft" :description="errorMessage" />

      <!-- table -->
      <UCard class="shadow-sm">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-semibold">Lista</div>

            <div class="text-sm text-gray-500 dark:text-gray-400">
              Strona <b class="text-gray-800 dark:text-gray-200">{{ page }}</b> z
              <b class="text-gray-800 dark:text-gray-200">{{ totalPages }}</b>
            </div>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-gray-500 dark:text-gray-400">
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <th class="py-3 px-3 font-medium">Administrator</th>
                <th class="py-3 px-3 font-medium">Email</th>
                <th class="py-3 px-3 font-medium">Rola</th>
                <th class="py-3 px-3 font-medium">Status</th>
                <th class="py-3 px-3 font-medium">Utworzono</th>
                <th class="py-3 px-3 font-medium">Ostatnie logowanie</th>
                <th class="py-3 px-3 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="a in admins"
                :key="a.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td class="py-3 px-3 font-medium whitespace-nowrap">
                  {{ a.name }}
                </td>

                <td class="py-3 px-3 min-w-[240px]">
                  <div class="truncate">{{ a.email }}</div>
                </td>

                <td class="py-3 px-3 whitespace-nowrap">
                  <UBadge :color="roleBadgeColor(a.roles)" variant="soft">
                    {{ roleLabel(a.roles) }}
                  </UBadge>
                </td>

                <td class="py-3 px-3 whitespace-nowrap">
                  <UBadge :color="statusBadgeColor(a)" variant="soft">
                    {{ statusLabel(a) }}
                  </UBadge>
                </td>

                <td class="py-3 px-3 whitespace-nowrap">
                  {{ a.created_at_fmt || '—' }}
                </td>

                <td class="py-3 px-3 whitespace-nowrap">
                  {{ a.last_login_at_fmt || '—' }}
                </td>

                <td class="py-3 px-3 text-right whitespace-nowrap">
                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-eye"
                    :to="localePath({ name: 'dashboard-admins-id', params: { id: a.id } })"
                  >
                    Podgląd
                  </UButton>

                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-pencil"
                    :to="localePath({ name: 'dashboard-admins-id-edit', params: { id: a.id } })"
                  >
                    Edytuj
                  </UButton>
                </td>
              </tr>

              <tr v-if="!loading && admins.length === 0">
                <td colspan="7" class="py-10 text-center text-gray-500 dark:text-gray-400">
                  Brak wyników dla wybranych filtrów.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <template #footer>
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Strona <b class="text-gray-800 dark:text-gray-200">{{ page }}</b> z
              <b class="text-gray-800 dark:text-gray-200">{{ totalPages }}</b>
            </div>

            <div class="flex items-center gap-2">
              <UButton
                size="sm"
                variant="soft"
                color="neutral"
                icon="i-lucide-chevron-left"
                :disabled="page <= 1"
                @click="page--"
              >
                Wstecz
              </UButton>

              <UButton
                size="sm"
                variant="soft"
                color="neutral"
                icon="i-lucide-chevron-right"
                :disabled="page >= totalPages"
                @click="page++"
              >
                Dalej
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </UPage>
</template>
