<script setup lang="ts">
import type { Customer, Order } from '~/data/orders.mock'
import {
  mockCustomers,
  mockOrdersSeed,
  getOrdersByCustomer,
  calcCustomerStats,
  formatPLN,
  statusLabel,
  statusColor,
  calcGrandTotal
} from '~/data/orders.mock'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const route = useRoute()
const localePath = useLocalePath()

const id = computed(() => String(route.params.id || ''))

// ✅ wspólny stan zamówień (jak w orders)
const ordersState = useState<Order[]>('orders', () => structuredClone(mockOrdersSeed))

// klienci są w data
const customers = mockCustomers as Customer[]

const customer = computed(() => customers.find(c => c.id === id.value) || null)

const customerOrders = computed(() => {
  if (!customer.value) return []
  return getOrdersByCustomer(ordersState.value, customer.value.id)
})

// statystyki klienta z jego zamówień
const stats = computed(() => calcCustomerStats(customerOrders.value))

// sort: najnowsze na górze
const recentOrders = computed(() => {
  return [...customerOrders.value].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
})
</script>

<template>
  <UPage>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">
            Klient <span class="text-gray-500" v-if="customer">{{ customer.name }}</span>
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Podgląd danych klienta oraz jego zamówień.
          </p>
        </div>

        <div class="flex gap-2">
          <UButton
            variant="ghost"
            icon="i-lucide-arrow-left"
            :to="localePath({ name: 'dashboard-clients' })"
          >
            Wróć
          </UButton>

          <UButton
            color="primary"
            icon="i-lucide-pencil"
            :to="localePath({ name: 'dashboard-clients-id-edit', params: { id } })"
          >
            Edytuj
          </UButton>
        </div>
      </div>

      <UAlert
        v-if="!customer"
        color="red"
        variant="soft"
        title="Nie znaleziono klienta"
        description="Sprawdź ID w adresie lub wróć do listy klientów."
      />

      <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Left -->
        <div class="xl:col-span-2 space-y-4">
          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Dane klienta</div>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div class="text-gray-500 dark:text-gray-400">Nazwa</div>
                <div class="font-medium">{{ customer.name }}</div>
              </div>

              <div>
                <div class="text-gray-500 dark:text-gray-400">Email</div>
                <div class="font-medium">{{ customer.email }}</div>
              </div>

              <div>
                <div class="text-gray-500 dark:text-gray-400">NIP</div>
                <div class="font-medium">{{ customer.nip }}</div>
              </div>

              <div>
                <div class="text-gray-500 dark:text-gray-400">Termin płatności</div>
                <div class="font-medium">{{ customer.paymentTermsDays }} dni</div>
              </div>
            </div>
          </UCard>

          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold">Zamówienia klienta</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Kliknij zamówienie, aby zobaczyć szczegóły.
                  </div>
                </div>

                <UButton
                  icon="i-lucide-plus"
                  color="primary"
                  variant="soft"
                  :to="localePath({ name: 'dashboard-orders-add' })"
                >
                  Dodaj zamówienie
                </UButton>
              </div>
            </template>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-left text-gray-500 dark:text-gray-400">
                  <tr class="border-b border-gray-100 dark:border-gray-800">
                    <th class="py-3 px-3 font-medium">Nr</th>
                    <th class="py-3 px-3 font-medium">Data</th>
                    <th class="py-3 px-3 font-medium">Status</th>
                    <th class="py-3 px-3 font-medium text-right">Wartość</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="o in recentOrders"
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

                    <td class="py-3 px-3 whitespace-nowrap">
                      {{ o.createdAt }}
                    </td>

                    <td class="py-3 px-3 whitespace-nowrap">
                      <UBadge :color="statusColor(o.status)" variant="soft">
                        {{ statusLabel(o.status) }}
                      </UBadge>
                    </td>

                    <td class="py-3 px-3 text-right font-semibold whitespace-nowrap">
                      {{ formatPLN(calcGrandTotal(o)) }}
                    </td>
                  </tr>

                  <tr v-if="recentOrders.length === 0">
                    <td colspan="4" class="py-10 text-center text-gray-500 dark:text-gray-400">
                      Ten klient nie ma jeszcze zamówień.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </div>

        <!-- Right -->
        <div class="space-y-4">
          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Statystyki</div>
            </template>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Liczba zamówień</span>
                <span class="font-semibold">{{ stats.ordersCount }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Łączny obrót</span>
                <span class="font-semibold">{{ formatPLN(stats.revenue) }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Ostatnie zamówienie</span>
                <span class="font-semibold">
                  <span v-if="stats.lastOrderDate">{{ stats.lastOrderDate }}</span>
                  <span v-else class="text-gray-500 dark:text-gray-400">—</span>
                </span>
              </div>
            </div>
          </UCard>

          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Akcje</div>
            </template>

            <div class="flex flex-col gap-2">
              <UButton
                icon="i-lucide-pencil"
                color="primary"
                variant="soft"
                :to="localePath({ name: 'dashboard-clients-id-edit', params: { id } })"
              >
                Edytuj klienta
              </UButton>

              <UButton
                icon="i-lucide-clipboard-list"
                color="neutral"
                variant="soft"
                :to="localePath({ name: 'dashboard-orders' })"
              >
                Przejdź do zamówień
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UPage>
</template>
