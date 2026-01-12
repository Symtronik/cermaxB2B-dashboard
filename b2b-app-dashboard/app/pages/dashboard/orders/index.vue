<script setup lang="ts">
import type { Order, OrderStatus } from '~/data/orders.mock'
import {
  mockOrdersSeed,
  mockCustomers,
  formatPLN,
  statusLabel,
  statusColor,
  getCustomer,
  calcGrandTotal,
  calcSubtotal
} from '~/data/orders.mock'

definePageMeta({ layout: 'app', middleware: 'auth' })

const localePath = useLocalePath()

// ✅ "store" w pamięci – wspólny dla add/edit/view
const ordersState = useState<Order[]>('orders', () => structuredClone(mockOrdersSeed))

const statusOptions: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Nowe', value: 'new' },
  { label: 'Opłacone', value: 'paid' },
  { label: 'W realizacji', value: 'processing' },
  { label: 'Wysłane', value: 'shipped' },
  { label: 'Anulowane', value: 'cancelled' }
]

const search = ref('')
const status = ref<OrderStatus | 'all'>('all')

// paginacja
const page = ref(1)
const pageSize = ref(6)

type OrderRow = {
  id: string
  customer: string
  email: string
  total: number
  status: OrderStatus
  itemsCount: number
  createdAt: string // YYYY-MM-DD
}

// mapujemy z Order -> OrderRow
const rows = computed<OrderRow[]>(() => {
  return ordersState.value.map(o => {
    const c = getCustomer(o.customerId)
    return {
      id: o.id,
      customer: c?.name ?? '—',
      email: c?.email ?? '—',
      total: calcGrandTotal(o),
      status: o.status,
      itemsCount: o.items.reduce((s, i) => s + i.qty, 0),
      createdAt: o.createdAt
    }
  })
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()

  return rows.value.filter(o => {
    const matchesStatus = status.value === 'all' ? true : o.status === status.value
    const matchesQuery = !q
      ? true
      : (
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)
        )
    return matchesStatus && matchesQuery
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paged = computed(() => {
  if (page.value > totalPages.value) page.value = 1
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})
</script>

<template>
  <UPage>
    <div class="space-y-6">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">Zamówienia</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Lista zamówień B2B z filtrowaniem i wyszukiwaniem.
          </p>
        </div>

        <UButton icon="i-lucide-plus" color="primary" :to="localePath({ name: 'dashboard-orders-add' })">
          Dodaj zamówienie
        </UButton>
      </div>

      <UCard class="shadow-sm">
        <div class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div class="flex flex-col sm:flex-row gap-3 w-full">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Szukaj: nr, klient, email…"
              class="w-full"
            />

            <USelect
              v-model="status"
              :options="statusOptions"
              option-attribute="label"
              value-attribute="value"
              class="w-full sm:w-64"
            />
          </div>

          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Wyniki: <b class="text-gray-800 dark:text-gray-200">{{ filtered.length }}</b></span>
          </div>
        </div>
      </UCard>

      <UCard class="shadow-sm">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-semibold">Lista</div>

            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">Na stronie</span>
              <USelect
                v-model="pageSize"
                :options="[{ label: '6', value: 6 }, { label: '10', value: 10 }, { label: '20', value: 20 }]"
                option-attribute="label"
                value-attribute="value"
                class="w-24"
              />
            </div>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-gray-500 dark:text-gray-400">
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <th class="py-3 px-3 font-medium">Nr</th>
                <th class="py-3 px-3 font-medium">Klient</th>
                <th class="py-3 px-3 font-medium">Data</th>
                <th class="py-3 px-3 font-medium">Pozycje</th>
                <th class="py-3 px-3 font-medium">Wartość</th>
                <th class="py-3 px-3 font-medium">Status</th>
                <th class="py-3 px-3 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="o in paged"
                :key="o.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td class="py-3 px-3 font-medium whitespace-nowrap">
                  <NuxtLink
                    :to="localePath({ name: 'dashboard-orders-id', params: { id: o.id } })"
                    class="hover:underline"
                  >
                    {{ o.id }}
                  </NuxtLink>
                </td>

                <td class="py-3 px-3 min-w-[240px]">
                  <div class="font-medium truncate">{{ o.customer }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ o.email }}</div>
                </td>

                <td class="py-3 px-3 whitespace-nowrap">{{ o.createdAt }}</td>
                <td class="py-3 px-3 text-center whitespace-nowrap">{{ o.itemsCount }}</td>
                <td class="py-3 px-3 font-semibold whitespace-nowrap">{{ formatPLN(o.total) }}</td>

                <td class="py-3 px-3 whitespace-nowrap">
                  <UBadge :color="statusColor(o.status)" variant="soft">
                    {{ statusLabel(o.status) }}
                  </UBadge>
                </td>

                <td class="py-3 px-3 text-right whitespace-nowrap">
                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-eye"
                    :to="localePath({ name: 'dashboard-orders-id', params: { id: o.id } })"
                  >
                    Podgląd
                  </UButton>

                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-pencil"
                    :to="localePath({ name: 'dashboard-orders-id-edit', params: { id: o.id } })"
                  >
                    Edytuj
                  </UButton>
                </td>
              </tr>

              <tr v-if="paged.length === 0">
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
              <UButton size="sm" variant="soft" color="neutral" icon="i-lucide-chevron-left" :disabled="page <= 1" @click="page--">
                Wstecz
              </UButton>

              <UButton size="sm" variant="soft" color="neutral" icon="i-lucide-chevron-right" :disabled="page >= totalPages" @click="page++">
                Dalej
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </UPage>
</template>
