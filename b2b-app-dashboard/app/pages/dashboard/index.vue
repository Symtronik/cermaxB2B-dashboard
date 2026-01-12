<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { allCategory } from '~/data/category'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const route = useRoute()

const activeCategory = computed(() => (route.query.category as string) || null)

// nazwa kategorii (lub null)
const categoryName = computed(() => {
  if (!activeCategory.value) return null
  return allCategory.find(cat => cat.categorySlug === activeCategory.value)?.name || null
})

// ===== Mock dane (na start) =====
type OrderStatus = 'new' | 'paid' | 'processing' | 'shipped' | 'cancelled'
type OrderRow = {
  id: string
  customer: string
  total: number
  status: OrderStatus
  createdAt: string
}

const stats = [
  { label: 'Nowe zamówienia', value: 12, icon: 'i-lucide-shopping-bag' },
  { label: 'Do wysyłki', value: 7, icon: 'i-lucide-truck' },
  { label: 'Niski stan magazynu', value: 4, icon: 'i-lucide-alert-triangle' },
  { label: 'Nowi klienci (7 dni)', value: 9, icon: 'i-lucide-user-plus' }
]

const todo = [
  { title: '3 zamówienia oczekują > 24h', desc: 'Sprawdź płatności i potwierdź realizację.', tone: 'warning' as const },
  { title: '2 produkty bez zdjęcia', desc: 'Uzupełnij zdjęcia dla lepszej konwersji.', tone: 'neutral' as const },
  { title: '1 produkt ma stan = 0', desc: 'Rozważ wyłączenie lub uzupełnienie magazynu.', tone: 'danger' as const }
]

const orders: OrderRow[] = [
  { id: 'ZAM-10241', customer: 'Firma ABC Sp. z o.o.', total: 1480.2, status: 'new', createdAt: '2026-01-05 10:12' },
  { id: 'ZAM-10240', customer: 'Hurtownia Delta', total: 325.0, status: 'paid', createdAt: '2026-01-05 09:44' },
  { id: 'ZAM-10239', customer: 'Sklep Omega', total: 799.99, status: 'processing', createdAt: '2026-01-04 18:03' },
  { id: 'ZAM-10238', customer: 'Firma Kappa', total: 210.0, status: 'shipped', createdAt: '2026-01-04 13:28' },
  { id: 'ZAM-10237', customer: 'B2B Partner', total: 1299.0, status: 'cancelled', createdAt: '2026-01-03 11:51' }
]

function formatPLN(value: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)
}

function statusLabel(s: OrderStatus) {
  switch (s) {
    case 'new': return 'Nowe'
    case 'paid': return 'Opłacone'
    case 'processing': return 'W realizacji'
    case 'shipped': return 'Wysłane'
    case 'cancelled': return 'Anulowane'
  }
}

function statusColor(s: OrderStatus) {
  // Nuxt UI UBadge colors
  switch (s) {
    case 'new': return 'primary'
    case 'paid': return 'green'
    case 'processing': return 'amber'
    case 'shipped': return 'blue'
    case 'cancelled': return 'red'
  }
}

const shortcuts = [
  { label: 'Zamówienia', icon: 'i-lucide-clipboard-list', to: localePath({ name: 'dashboard-orders' }) },
  { label: 'Dodaj produkt', icon: 'i-lucide-package-plus', to: localePath({ name: 'dashboard-products-add-product' }) },
  { label: 'Produkty', icon: 'i-lucide-package', to: localePath({ name: 'dashboard-products' }) },
  { label: 'Klienci', icon: 'i-lucide-users', to: localePath({ name: 'dashboard-clients' }) }
]
</script>

<template>
  <UPage>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">Start</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Szybki podgląd najważniejszych rzeczy w panelu.
          </p>

          <!-- (opcjonalnie) aktywna kategoria z query -->
          <div v-if="categoryName" class="mt-2">
            <UBadge color="neutral" variant="soft">
              Aktywna kategoria: {{ categoryName }}
            </UBadge>
          </div>
        </div>

        <div class="flex gap-2">
          <UButton
            icon="i-lucide-clipboard-list"
            :to="localePath({ name: 'dashboard-orders' })"
            color="primary"
          >
            Przejdź do zamówień
          </UButton>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <UCard v-for="s in stats" :key="s.label" class="shadow-sm">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <UIcon :name="s.icon" class="size-5 text-gray-700 dark:text-gray-200" />
            </div>

            <div class="min-w-0">
              <div class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ s.label }}</div>
              <div class="text-2xl font-semibold">{{ s.value }}</div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Left: Orders -->
        <UCard class="xl:col-span-2 shadow-sm">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">Ostatnie zamówienia</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Ostatnie 5 zamówień z systemu.</p>
              </div>
              <UButton
                variant="ghost"
                icon="i-lucide-arrow-right"
                :to="localePath({ name: 'dashboard-orders' })"
              >
                Zobacz wszystkie
              </UButton>
            </div>
          </template>

          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div
              v-for="o in orders"
              :key="o.id"
              class="py-3 flex items-center gap-3"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <div class="font-medium truncate">{{ o.id }}</div>
                  <UBadge :color="statusColor(o.status)" variant="soft">
                    {{ statusLabel(o.status) }}
                  </UBadge>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ o.customer }} • {{ o.createdAt }}
                </div>
              </div>

              <div class="text-right">
                <div class="font-semibold">{{ formatPLN(o.total) }}</div>
                <UButton size="xs" variant="ghost" icon="i-lucide-eye">
                  Podgląd
                </UButton>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Right: To-do + Shortcuts -->
        <div class="space-y-4">
          <UCard class="shadow-sm">
            <template #header>
              <div>
                <h3 class="font-semibold">Do zrobienia</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Alerty i szybkie akcje.</p>
              </div>
            </template>

            <div class="space-y-3">
              <UAlert
                v-for="a in todo"
                :key="a.title"
                :title="a.title"
                :description="a.desc"
                :color="a.tone === 'danger' ? 'red' : a.tone === 'warning' ? 'amber' : 'neutral'"
                variant="soft"
              />
            </div>
          </UCard>

          <UCard class="shadow-sm">
            <template #header>
              <div>
                <h3 class="font-semibold">Skróty</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Najczęstsze akcje.</p>
              </div>
            </template>

            <div class="grid grid-cols-2 gap-2">
              <UButton
                v-for="s in shortcuts"
                :key="s.label"
                :to="s.to"
                variant="soft"
                color="neutral"
                class="justify-start"
                :icon="s.icon"
              >
                {{ s.label }}
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UPage>
</template>
