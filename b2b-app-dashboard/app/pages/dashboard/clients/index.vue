<script setup lang="ts">
import type { Customer, Order } from '~/data/orders.mock'
import {
  mockCustomers,
  mockOrdersSeed,
  formatPLN,
  getOrdersByCustomer,
  calcCustomerStats
} from '~/data/orders.mock'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const localePath = useLocalePath()

// ✅ wspólny stan zamówień (fallback na seed)
const ordersState = useState<Order[]>('orders', () => structuredClone(mockOrdersSeed))

// ✅ wspólny stan klientów (fallback na seed)
const customersState = useState<Customer[]>('customers', () => structuredClone(mockCustomers))

const search = ref('')
const page = ref(1)
const pageSize = ref(10)

type CustomerRow = {
  id: string
  name: string
  email: string
  nip: string
  paymentTermsDays: number
  ordersCount: number
  revenue: number
  lastOrderDate: string | null
}

const rows = computed<CustomerRow[]>(() => {
  return customersState.value.map((c) => {
    const customerOrders = getOrdersByCustomer(ordersState.value, c.id)
    const stats = calcCustomerStats(customerOrders)

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      nip: c.nip,
      paymentTermsDays: c.paymentTermsDays,
      ordersCount: stats.ordersCount,
      revenue: stats.revenue,
      lastOrderDate: stats.lastOrderDate
    }
  })
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value

  return rows.value.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.email.toLowerCase().includes(q) ||
    r.nip.toLowerCase().includes(q)
  )
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
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">Klienci</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Lista klientów B2B + szybkie statystyki oparte o zamówienia.
          </p>
        </div>

        <UButton icon="i-lucide-user-plus" color="primary" variant="soft">
          Dodaj klienta (mock)
        </UButton>
      </div>

      <!-- Filters -->
      <UCard class="shadow-sm">
        <div class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Szukaj: nazwa, email, NIP…"
            class="w-full md:max-w-md"
          />

          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Wyniki: <b class="text-gray-800 dark:text-gray-200">{{ filtered.length }}</b></span>

            <USelect
              v-model="pageSize"
              :options="[{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '50', value: 50 }]"
              option-attribute="label"
              value-attribute="value"
              class="w-24"
            />
          </div>
        </div>
      </UCard>

      <!-- Table -->
      <UCard class="shadow-sm">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-semibold">Lista klientów</div>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-gray-500 dark:text-gray-400">
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <th class="py-3 px-3 font-medium">Klient</th>
                <th class="py-3 px-3 font-medium">NIP</th>
                <th class="py-3 px-3 font-medium">Termin</th>
                <th class="py-3 px-3 font-medium">Zamówienia</th>
                <th class="py-3 px-3 font-medium">Obrót</th>
                <th class="py-3 px-3 font-medium">Ostatnie</th>
                <th class="py-3 px-3 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="c in paged"
                :key="c.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td class="py-3 px-3 min-w-[260px]">
                  <div class="font-medium truncate">{{ c.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ c.email }}</div>
                </td>

                <td class="py-3 px-3 whitespace-nowrap">{{ c.nip }}</td>

                <td class="py-3 px-3 whitespace-nowrap">
                  <UBadge color="neutral" variant="soft">
                    {{ c.paymentTermsDays }} dni
                  </UBadge>
                </td>

                <td class="py-3 px-3 text-center whitespace-nowrap">
                  {{ c.ordersCount }}
                </td>

                <td class="py-3 px-3 font-semibold whitespace-nowrap">
                  {{ formatPLN(c.revenue) }}
                </td>

                <td class="py-3 px-3 whitespace-nowrap">
                  <span v-if="c.lastOrderDate">{{ c.lastOrderDate }}</span>
                  <span v-else class="text-gray-500 dark:text-gray-400">—</span>
                </td>

                <td class="py-3 px-3 text-right whitespace-nowrap">
                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-eye"
                    :to="localePath({ name: 'dashboard-clients-id', params: { id: c.id } })"
                  >
                    Podgląd
                  </UButton>

                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-pencil"
                    :to="localePath({ name: 'dashboard-clients-id-edit', params: { id: c.id } })"
                  >
                    Edytuj
                  </UButton>
                </td>
              </tr>

              <tr v-if="paged.length === 0">
                <td colspan="7" class="py-10 text-center text-gray-500 dark:text-gray-400">
                  Brak klientów dla podanych filtrów.
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
