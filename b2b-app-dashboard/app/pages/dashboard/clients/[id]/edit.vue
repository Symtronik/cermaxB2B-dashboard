<script setup lang="ts">
import type { Customer } from '~/data/orders.mock'
import { mockCustomers } from '~/data/orders.mock'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const route = useRoute()
const localePath = useLocalePath()

const id = computed(() => String(route.params.id || ''))

// ✅ wspólny stan klientów w pamięci (jak ordersState)
const customersState = useState<Customer[]>('customers', () => structuredClone(mockCustomers))

const originalIndex = computed(() => customersState.value.findIndex(c => c.id === id.value))
const original = computed(() => (originalIndex.value >= 0 ? customersState.value[originalIndex.value] : null))

const form = reactive({
  name: '',
  email: '',
  nip: '',
  paymentTermsDays: 14
})

// init kopią, żeby nie edytować referencji “w locie”
watchEffect(() => {
  if (!original.value) return
  if (!form.name) {
    form.name = original.value.name
    form.email = original.value.email
    form.nip = original.value.nip
    form.paymentTermsDays = original.value.paymentTermsDays
  }
})

function normalizeNip(nip: string) {
  return (nip || '').replace(/\s|-/g, '').trim()
}

function clampTerms() {
  if (!Number.isFinite(form.paymentTermsDays)) form.paymentTermsDays = 14
  if (form.paymentTermsDays < 0) form.paymentTermsDays = 0
  if (form.paymentTermsDays > 120) form.paymentTermsDays = 120
}

const errors = computed(() => {
  const e: string[] = []

  if (!form.name.trim()) e.push('Uzupełnij nazwę klienta.')
  if (!form.email.trim()) e.push('Uzupełnij email.')
  if (!form.nip.trim()) e.push('Uzupełnij NIP.')

  const nip = normalizeNip(form.nip)
  if (nip && !/^\d{10}$/.test(nip)) e.push('NIP powinien mieć 10 cyfr (bez spacji i myślników).')

  if (!Number.isFinite(form.paymentTermsDays) || form.paymentTermsDays < 0) e.push('Termin płatności musi być liczbą >= 0.')

  return e
})

const isSubmitting = ref(false)

async function submit() {
  clampTerms()

  if (!original.value || originalIndex.value < 0) return
  if (errors.value.length) return

  isSubmitting.value = true
  try {
    const updated: Customer = {
      id: original.value.id,
      name: form.name.trim(),
      email: form.email.trim(),
      nip: normalizeNip(form.nip),
      paymentTermsDays: Number(form.paymentTermsDays)
    }

    // ✅ mock zapis do stanu
    customersState.value.splice(originalIndex.value, 1, updated)

    await navigateTo(localePath({ name: 'dashboard-clients-id', params: { id: updated.id } }))
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
          <h2 class="text-xl font-semibold">
            Edycja klienta <span class="text-gray-500">{{ id }}</span>
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Zmień dane klienta B2B.
          </p>
        </div>

        <div class="flex gap-2">
          <UButton
            variant="ghost"
            icon="i-lucide-x"
            :to="localePath({ name: 'dashboard-clients-id', params: { id } })"
          >
            Anuluj
          </UButton>

          <UButton
            color="primary"
            icon="i-lucide-check"
            :loading="isSubmitting"
            @click="submit"
          >
            Zapisz zmiany
          </UButton>
        </div>
      </div>

      <UAlert
        v-if="!original"
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormField label="Nazwa firmy">
                <UInput v-model="form.name" placeholder="np. Firma ABC Sp. z o.o." />
              </UFormField>

              <UFormField label="Email">
                <UInput v-model="form.email" type="email" placeholder="np. zakupy@firma.pl" />
              </UFormField>

              <UFormField label="NIP">
                <UInput v-model="form.nip" placeholder="10 cyfr" />
              </UFormField>

              <UFormField label="Termin płatności (dni)">
                <UInput
                  v-model.number="form.paymentTermsDays"
                  type="number"
                  min="0"
                  max="120"
                  step="1"
                  @blur="clampTerms"
                />
              </UFormField>
            </div>

            <div v-if="errors.length" class="mt-4">
              <UAlert
                color="red"
                variant="soft"
                title="Formularz niekompletny"
                :description="errors[0]"
              />
            </div>
          </UCard>
        </div>

        <!-- Right -->
        <div class="space-y-4">
          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Akcje</div>
            </template>

            <div class="flex flex-col gap-2">
              <UButton
                color="primary"
                icon="i-lucide-check"
                :loading="isSubmitting"
                @click="submit"
              >
                Zapisz zmiany
              </UButton>

              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-arrow-left"
                :to="localePath({ name: 'dashboard-clients-id', params: { id } })"
              >
                Wróć do podglądu
              </UButton>

              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-users"
                :to="localePath({ name: 'dashboard-clients' })"
              >
                Lista klientów
              </UButton>
            </div>
          </UCard>

          <UCard class="shadow-sm">
            <template #header>
              <div class="font-semibold">Wskazówka</div>
            </template>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Później podepniemy API: PUT /clients/:id. Ten formularz już ma gotową strukturę payloadu.
            </p>
          </UCard>
        </div>
      </div>
    </div>
  </UPage>
</template>
