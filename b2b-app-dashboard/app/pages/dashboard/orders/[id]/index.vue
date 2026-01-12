<script setup lang="ts">
import type { Order } from '~/data/orders.mock'
import {
  getCustomer,
  formatPLN,
  statusLabel,
  statusColor,
  calcSubtotal,
  calcDiscountValue,
  calcVatTotal,
  calcGrandTotal
} from '~/data/orders.mock'

definePageMeta({ layout: 'app', middleware: 'auth' })

const route = useRoute()
const localePath = useLocalePath()

const ordersState = useState<Order[]>('orders') // korzysta z tego samego stanu co lista/add/edit
const id = computed(() => String(route.params.id || ''))

const order = computed(() => ordersState.value?.find(o => o.id === id.value) || null)
const customer = computed(() => order.value ? getCustomer(order.value.customerId) : null)

const subtotal = computed(() => order.value ? calcSubtotal(order.value) : 0)
const discountValue = computed(() => order.value ? calcDiscountValue(subtotal.value, order.value.discountPercent) : 0)
const vatTotal = computed(() => order.value ? calcVatTotal(order.value) : 0)
const grandTotal = computed(() => order.value ? calcGrandTotal(order.value) : 0)
</script>

<template>
  <UPage>
    <div class="space-y-6">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">
            Podgląd zamówienia <span class="text-gray-500">{{ id }}</span>
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Szczegóły, pozycje i podsumowanie.</p>
        </div>

        <div class="flex gap-2">
          <UButton variant="ghost" icon="i-lucide-arrow-left" :to="localePath({ name: 'dashboard-orders' })">
            Wróć
          </UButton>

          <UButton
            color="primary"
            icon="i-lucide-pencil"
            :to="localePath({ name: 'dashboard-orders-id-edit', params: { id } })"
          >
            Edytuj
          </UButton>
        </div>
      </div>

      <UAlert
        v-if="!order"
        color="red"
        variant="soft"
        title="Nie znaleziono zamówienia"
        description="Sprawdź ID w adresie lub wróć do listy zamówień."
      />

      <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="xl:col-span-2 space-y-4">
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-semibold">Informacje</div>
                <UBadge :color="statusColor(order.status)" variant="soft">
                  {{ statusLabel(order.status) }}
                </UBadge>
              </div>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div class="text-gray-500 dark:text-gray-400">Data</div>
                <div class="font-medium">{{ order.createdAt }}</div>
              </div>

              <div>
                <div class="text-gray-500 dark:text-gray-400">Rabat</div>
                <div class="font-medium">{{ order.discountPercent }}%</div>
              </div>

              <div class="md:col-span-2">
                <div class="text-gray-500 dark:text-gray-400">Klient</div>
                <div class="font-medium">{{ customer?.name ?? '—' }}</div>
                <div class="text-gray-500 dark:text-gray-400">
                  {{ customer?.email ?? '—' }} • NIP: {{ customer?.nip ?? '—' }} • Termin: {{ customer?.paymentTermsDays ?? '—' }} dni
                </div>
              </div>

              <div class="md:col-span-2" v-if="order.note">
                <div class="text-gray-500 dark:text-gray-400">Notatka</div>
                <div class="font-medium">{{ order.note }}</div>
              </div>
            </div>
          </UCard>

          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Pozycje</div>
            </template>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-left text-gray-500 dark:text-gray-400">
                  <tr class="border-b border-gray-100 dark:border-gray-800">
                    <th class="py-3 px-3">Produkt</th>
                    <th class="py-3 px-3 w-28">Ilość</th>
                    <th class="py-3 px-3 w-36">Cena</th>
                    <th class="py-3 px-3 w-28">VAT</th>
                    <th class="py-3 px-3 w-36 text-right">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="it in order.items" :key="it.productId" class="border-b border-gray-100 dark:border-gray-800">
                    <td class="py-3 px-3 min-w-[260px]">
                      <div class="font-medium">{{ it.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ it.sku }}</div>
                    </td>
                    <td class="py-3 px-3">{{ it.qty }}</td>
                    <td class="py-3 px-3">{{ formatPLN(it.unitPrice) }}</td>
                    <td class="py-3 px-3">
                      <UBadge color="neutral" variant="soft">{{ it.vatRate }}%</UBadge>
                    </td>
                    <td class="py-3 px-3 text-right font-semibold">{{ formatPLN(it.qty * it.unitPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </div>

        <div class="space-y-4">
          <UCard class="shadow-sm">
            <template #header><div class="font-semibold">Podsumowanie</div></template>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Suma netto</span>
                <span class="font-semibold">{{ formatPLN(subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Rabat</span>
                <span class="font-semibold">- {{ formatPLN(discountValue) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">VAT (szac.)</span>
                <span class="font-semibold">{{ formatPLN(vatTotal) }}</span>
              </div>

              <div class="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span class="text-gray-700 dark:text-gray-200 font-medium">Razem brutto</span>
                <span class="text-lg font-semibold">{{ formatPLN(grandTotal) }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UPage>
</template>
