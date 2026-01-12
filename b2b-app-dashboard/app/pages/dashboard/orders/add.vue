<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const localePath = useLocalePath()
const toast = useToast?.()

type Customer = {
  id: string
  name: string
  email: string
  nip: string
  paymentTermsDays: number
}

type Product = {
  id: string
  sku: string
  name: string
  price: number // cena jednostkowa
  vatRate: number // np. 23
}

type OrderItem = {
  productId: string
  name: string
  sku: string
  qty: number
  unitPrice: number
  vatRate: number
}

const customers: Customer[] = [
  { id: 'c1', name: 'Firma ABC Sp. z o.o.', email: 'zakupy@abc.pl', nip: '1234567890', paymentTermsDays: 14 },
  { id: 'c2', name: 'Hurtownia Delta', email: 'b2b@delta.pl', nip: '9876543210', paymentTermsDays: 7 },
  { id: 'c3', name: 'Sklep Omega', email: 'kontakt@omega.pl', nip: '5554443332', paymentTermsDays: 30 }
]

const products: Product[] = [
  { id: 'p1', sku: 'CER-001', name: 'Płytka gres 60x60', price: 89.99, vatRate: 23 },
  { id: 'p2', sku: 'CER-002', name: 'Fuga elastyczna 2kg', price: 24.5, vatRate: 23 },
  { id: 'p3', sku: 'CER-003', name: 'Klej do płytek 25kg', price: 39.0, vatRate: 8 },
  { id: 'p4', sku: 'CER-004', name: 'Listwa wykończeniowa', price: 15.9, vatRate: 23 }
]

// --- formularz ---
const form = reactive({
  customerId: '' as string,
  orderNumber: 'ZAM-NEW-0001',
  createdAt: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  discountPercent: 0,
  note: ''
})

const selectedProductId = ref<string>('')

const items = ref<OrderItem[]>([
  // przykładowa pozycja startowa (możesz usunąć jeśli nie chcesz)
  { productId: 'p1', sku: 'CER-001', name: 'Płytka gres 60x60', qty: 10, unitPrice: 89.99, vatRate: 23 }
])

const selectedCustomer = computed(() => customers.find(c => c.id === form.customerId) || null)

function addItemFromSelectedProduct() {
  const prod = products.find(p => p.id === selectedProductId.value)
  if (!prod) return

  // jeśli już jest w pozycjach, zwiększ qty
  const existing = items.value.find(i => i.productId === prod.id)
  if (existing) {
    existing.qty += 1
  } else {
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

const subtotal = computed(() =>
  items.value.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
)

const discountValue = computed(() => {
  const d = (subtotal.value * (form.discountPercent || 0)) / 100
  return Math.max(0, d)
})

const totalAfterDiscount = computed(() => Math.max(0, subtotal.value - discountValue.value))

// prosty VAT: liczony od ceny po rabacie proporcjonalnie do udziału pozycji
const vatTotal = computed(() => {
  const sub = subtotal.value || 0
  if (sub <= 0) return 0

  const ratio = totalAfterDiscount.value / sub

  return items.value.reduce((sum, i) => {
    const line = i.qty * i.unitPrice
    const lineAfter = line * ratio
    const vat = lineAfter * (i.vatRate / 100)
    return sum + vat
  }, 0)
})

const grandTotal = computed(() => totalAfterDiscount.value + vatTotal.value)

function formatPLN(v: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v)
}

const errors = computed(() => {
  const e: string[] = []
  if (!form.customerId) e.push('Wybierz klienta.')
  if (items.value.length === 0) e.push('Dodaj przynajmniej jedną pozycję.')
  if (items.value.some(i => i.qty < 1)) e.push('Ilość w pozycjach musi być >= 1.')
  return e
})

const isSubmitting = ref(false)

async function submit() {
  clampDiscount()

  if (errors.value.length) {
    toast?.add?.({ title: 'Uzupełnij formularz', description: errors.value[0], color: 'red' })
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      ...form,
      customer: selectedCustomer.value,
      items: items.value,
      summary: {
        subtotal: subtotal.value,
        discountPercent: form.discountPercent,
        discountValue: discountValue.value,
        vatTotal: vatTotal.value,
        grandTotal: grandTotal.value
      }
    }

    // TODO: podłącz API
    console.log('CREATE ORDER payload:', payload)

    toast?.add?.({ title: 'Zamówienie utworzone (mock)', description: 'Na razie zapis jest tylko w konsoli.', color: 'green' })

    // np. przekierowanie na listę:
    await navigateTo(localePath({ name: 'dashboard-orders' }))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UPage>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">Dodaj zamówienie</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Wersja mock — później podepniemy pod API.
          </p>
        </div>

        <div class="flex gap-2">
          <UButton
            variant="ghost"
            icon="i-lucide-arrow-left"
            :to="localePath({ name: 'dashboard-orders' })"
          >
            Wróć
          </UButton>

          <UButton
            color="primary"
            icon="i-lucide-check"
            :loading="isSubmitting"
            @click="submit"
          >
            Zapisz zamówienie
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Left: form -->
        <div class="xl:col-span-2 space-y-4">
          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Dane zamówienia</div>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormField label="Numer zamówienia">
                <UInput v-model="form.orderNumber" placeholder="np. ZAM-10242" />
              </UFormField>

              <UFormField label="Data">
                <UInput v-model="form.createdAt" type="date" />
              </UFormField>

              <UFormField label="Klient">
                <USelect
                  v-model="form.customerId"
                  :options="customers.map(c => ({ label: c.name, value: c.id }))"
                  placeholder="Wybierz klienta"
                />
              </UFormField>

              <UFormField label="Rabat (%)">
                <UInput
                  v-model.number="form.discountPercent"
                  type="number"
                  min="0"
                  max="90"
                  step="1"
                  @blur="clampDiscount"
                />
              </UFormField>

              <div class="md:col-span-2">
                <UFormField label="Notatka">
                  <UTextarea v-model="form.note" placeholder="Dodatkowe informacje do zamówienia..." />
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
                  <div class="text-sm text-gray-500 dark:text-gray-400">Dodaj produkty i ilości.</div>
                </div>

                <div class="flex gap-2 items-center">
                  <USelect
                    v-model="selectedProductId"
                    :options="products.map(p => ({ label: `${p.sku} • ${p.name} (${p.price.toFixed(2)} PLN)`, value: p.id }))"
                    placeholder="Wybierz produkt"
                    class="w-72 max-w-full"
                  />
                  <UButton
                    icon="i-lucide-plus"
                    color="neutral"
                    variant="soft"
                    :disabled="!selectedProductId"
                    @click="addItemFromSelectedProduct"
                  >
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
                  <tr
                    v-for="(it, idx) in items"
                    :key="it.productId"
                    class="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td class="py-3 px-3 min-w-[260px]">
                      <div class="font-medium">{{ it.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ it.sku }}</div>
                    </td>

                    <td class="py-3 px-3">
                      <UInput
                        v-model.number="it.qty"
                        type="number"
                        min="1"
                        step="1"
                        @blur="clampQty(it)"
                      />
                    </td>

                    <td class="py-3 px-3">
                      <UInput
                        v-model.number="it.unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        @blur="clampPrice(it)"
                      />
                    </td>

                    <td class="py-3 px-3">
                      <UBadge color="neutral" variant="soft">{{ it.vatRate }}%</UBadge>
                    </td>

                    <td class="py-3 px-3 text-right font-semibold">
                      {{ formatPLN(it.qty * it.unitPrice) }}
                    </td>

                    <td class="py-3 px-3 text-right">
                      <UButton
                        size="xs"
                        color="red"
                        variant="soft"
                        icon="i-lucide-trash-2"
                        @click="removeItem(idx)"
                      />
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

        <!-- Right: summary -->
        <div class="space-y-4">
          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Podsumowanie</div>
            </template>

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
                <span class="text-gray-500 dark:text-gray-400">Netto po rabacie</span>
                <span class="font-semibold">{{ formatPLN(totalAfterDiscount) }}</span>
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
              <UAlert
                color="red"
                variant="soft"
                title="Formularz niekompletny"
                :description="errors[0]"
              />
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <UButton
                color="primary"
                icon="i-lucide-check"
                :loading="isSubmitting"
                @click="submit"
              >
                Zapisz zamówienie
              </UButton>

              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-x"
                :to="localePath({ name: 'dashboard-orders' })"
              >
                Anuluj
              </UButton>
            </div>
          </UCard>

          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Wskazówka</div>
            </template>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              Następny krok: podepnij klientów i produkty z API, a na submit wyślij payload do backendu.
              Potem dodamy wybór adresu dostawy, formę płatności i statusy.
            </p>
          </UCard>
        </div>
      </div>
    </div>
  </UPage>
</template>
