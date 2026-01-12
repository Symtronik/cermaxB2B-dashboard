<script setup lang="ts">
import type { Order, OrderItem, Customer, Product } from '~/data/orders.mock'
import {
  mockCustomers,
  mockProducts,
  formatPLN,
  calcSubtotal,
  calcDiscountValue,
  calcVatTotal,
  calcGrandTotal
} from '~/data/orders.mock'

definePageMeta({ layout: 'app', middleware: 'auth' })

const route = useRoute()
const localePath = useLocalePath()

const id = computed(() => String(route.params.id || ''))

const ordersState = useState<Order[]>('orders')
const customers = mockCustomers as Customer[]
const products = mockProducts as Product[]

const originalIndex = computed(() => ordersState.value.findIndex(o => o.id === id.value))
const original = computed(() => (originalIndex.value >= 0 ? ordersState.value[originalIndex.value] : null))

const form = reactive({
  customerId: '',
  createdAt: '',
  discountPercent: 0,
  note: ''
})

const items = ref<OrderItem[]>([])
const selectedProductId = ref('')

// init: skopiuj dane do formularza (kopie głębokie)
watchEffect(() => {
  if (!original.value) return
  if (!form.customerId) {
    form.customerId = original.value.customerId
    form.createdAt = original.value.createdAt
    form.discountPercent = original.value.discountPercent
    form.note = original.value.note
    items.value = original.value.items.map(i => ({ ...i }))
  }
})

const selectedCustomer = computed(() => customers.find(c => c.id === form.customerId) || null)

function addItemFromSelectedProduct() {
  const prod = products.find(p => p.id === selectedProductId.value)
  if (!prod) return

  const existing = items.value.find(i => i.productId === prod.id)
  if (existing) existing.qty += 1
  else {
    items.value.push({
      productId: prod.id,
      sku: prod.sku,
      name: prod.name,
      qty: 1,
      unitPrice: prod.price,
      vatRate: prod.vatRate
    })
  }
  selectedProductId.value = ''
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function clampQty(i: OrderItem) {
  if (!Number.isFinite(i.qty) || i.qty < 1) i.qty = 1
}
function clampPrice(i: OrderItem) {
  if (!Number.isFinite(i.unitPrice) || i.unitPrice < 0) i.unitPrice = 0
}
function clampDiscount() {
  if (!Number.isFinite(form.discountPercent)) form.discountPercent = 0
  if (form.discountPercent < 0) form.discountPercent = 0
  if (form.discountPercent > 90) form.discountPercent = 90
}

const subtotal = computed(() => calcSubtotal({ items: items.value }))
const discountValue = computed(() => calcDiscountValue(subtotal.value, form.discountPercent))
const vatTotal = computed(() => calcVatTotal({ items: items.value, discountPercent: form.discountPercent }))
const grandTotal = computed(() => calcGrandTotal({ items: items.value, discountPercent: form.discountPercent }))

const errors = computed(() => {
  const e: string[] = []
  if (!form.customerId) e.push('Wybierz klienta.')
  if (!form.createdAt) e.push('Uzupełnij datę.')
  if (items.value.length === 0) e.push('Dodaj przynajmniej jedną pozycję.')
  if (items.value.some(i => i.qty < 1)) e.push('Ilość w pozycjach musi być >= 1.')
  return e
})

const isSubmitting = ref(false)

async function submit() {
  clampDiscount()

  if (!original.value || originalIndex.value < 0) {
    // brak zamówienia
    return
  }
  if (errors.value.length) return

  isSubmitting.value = true
  try {
    const updated: Order = {
      ...original.value,
      customerId: form.customerId,
      createdAt: form.createdAt,
      discountPercent: form.discountPercent,
      note: form.note,
      items: items.value.map(i => ({ ...i }))
    }

    // ✅ mock "save": nadpisujemy w state
    ordersState.value.splice(originalIndex.value, 1, updated)

    await navigateTo(localePath({ name: 'dashboard-orders-id', params: { id: updated.id } }))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UPage>
    <div class="space-y-6">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">
            Edycja zamówienia <span class="text-gray-500">{{ id }}</span>
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Zmień klienta, rabat, notatkę i pozycje.</p>
        </div>

        <div class="flex gap-2">
          <UButton variant="ghost" icon="i-lucide-x" :to="localePath({ name: 'dashboard-orders-id', params: { id } })">
            Anuluj
          </UButton>

          <UButton color="primary" icon="i-lucide-check" :loading="isSubmitting" @click="submit">
            Zapisz zmiany
          </UButton>
        </div>
      </div>

      <UAlert
        v-if="!original"
        color="red"
        variant="soft"
        title="Nie znaleziono zamówienia"
        description="Sprawdź ID w adresie lub wróć do listy."
      />

      <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="xl:col-span-2 space-y-4">
          <UCard class="shadow-sm">
            <template #header><div class="font-semibold">Dane zamówienia</div></template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormField label="Data">
                <UInput v-model="form.createdAt" type="date" />
              </UFormField>

              <UFormField label="Rabat (%)">
                <UInput v-model.number="form.discountPercent" type="number" min="0" max="90" step="1" @blur="clampDiscount" />
              </UFormField>

              <UFormField label="Klient" class="md:col-span-2">
                <USelect
                  v-model="form.customerId"
                  :options="customers.map(c => ({ label: c.name, value: c.id }))"
                  placeholder="Wybierz klienta"
                />
              </UFormField>

              <div class="md:col-span-2">
                <UFormField label="Notatka">
                  <UTextarea v-model="form.note" placeholder="Dodatkowe informacje..." />
                </UFormField>
              </div>
            </div>

            <div v-if="selectedCustomer" class="mt-4">
              <UAlert
                color="neutral"
                variant="soft"
                :title="`Wybrany klient: ${selectedCustomer.name}`"
                :description="`Email: ${selectedCustomer.email} • NIP: ${selectedCustomer.nip} • Termin: ${selectedCustomer.paymentTermsDays} dni`"
              />
            </div>
          </UCard>

          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold">Pozycje zamówienia</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Dodaj / usuń / edytuj.</div>
                </div>

                <div class="flex gap-2 items-center">
                  <USelect
                    v-model="selectedProductId"
                    :options="products.map(p => ({ label: `${p.sku} • ${p.name} (${p.price.toFixed(2)} PLN)`, value: p.id }))"
                    placeholder="Wybierz produkt"
                    class="w-72 max-w-full"
                  />
                  <UButton icon="i-lucide-plus" color="neutral" variant="soft" :disabled="!selectedProductId" @click="addItemFromSelectedProduct">
                    Dodaj
                  </UButton>
                </div>
              </div>
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
                    <th class="py-3 px-3 w-20"></th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(it, idx) in items" :key="it.productId" class="border-b border-gray-100 dark:border-gray-800">
                    <td class="py-3 px-3 min-w-[260px]">
                      <div class="font-medium">{{ it.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ it.sku }}</div>
                    </td>

                    <td class="py-3 px-3">
                      <UInput v-model.number="it.qty" type="number" min="1" step="1" @blur="clampQty(it)" />
                    </td>

                    <td class="py-3 px-3">
                      <UInput v-model.number="it.unitPrice" type="number" min="0" step="0.01" @blur="clampPrice(it)" />
                    </td>

                    <td class="py-3 px-3">
                      <UBadge color="neutral" variant="soft">{{ it.vatRate }}%</UBadge>
                    </td>

                    <td class="py-3 px-3 text-right font-semibold">{{ formatPLN(it.qty * it.unitPrice) }}</td>

                    <td class="py-3 px-3 text-right">
                      <UButton size="xs" color="red" variant="soft" icon="i-lucide-trash-2" @click="removeItem(idx)" />
                    </td>
                  </tr>

                  <tr v-if="items.length === 0">
                    <td colspan="6" class="py-10 text-center text-gray-500 dark:text-gray-400">
                      Brak pozycji. Dodaj produkt powyżej.
                    </td>
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
                <span class="text-gray-500 dark:text-gray-400">Rabat ({{ form.discountPercent }}%)</span>
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

            <div v-if="errors.length" class="mt-4">
              <UAlert color="red" variant="soft" title="Formularz niekompletny" :description="errors[0]" />
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <UButton color="primary" icon="i-lucide-check" :loading="isSubmitting" @click="submit">
                Zapisz zmiany
              </UButton>

              <UButton color="neutral" variant="soft" icon="i-lucide-arrow-left" :to="localePath({ name: 'dashboard-orders-id', params: { id } })">
                Wróć do podglądu
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UPage>
</template>
