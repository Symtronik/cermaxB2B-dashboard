<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allProducts, allSeries } from '~/data/products' // dostosuj ścieżkę

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const seriesSlug = computed(() => route.params.slug as string)

// nazwa serii do nagłówka
const seriesName = computed(() => {
  return allSeries.find(s => s.slug === seriesSlug.value)?.name || 'Produkty z serii'
})

// produkty tylko z tej serii
const products = computed(() =>
  allProducts.filter(p => p.seriesSlug === seriesSlug.value)
)

const goBack = () => {
  // wróć do poprzedniej strony
  router.back()
  // albo na sztywno do listy serii:
  // router.push('/dashboard/produkty')
}
</script>

<template>
  <UPage>
    <div class="p-4 sm:p-8 space-y-6">
      <!-- Nagłówek + powrót -->
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">
            {{ seriesName }}
          </h1>
          <p class="text-sm text-gray-500">
            Wszystkie produkty z tej serii. Wybierz ilość i dodaj do koszyka.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-95 transition"
          @click="goBack"
        >
          <span>←</span>
          <span>Powrót</span>
        </button>
      </header>

      <!-- Gdy brak produktów w serii -->
      <div
        v-if="!products.length"
        class="text-sm text-gray-500"
      >
        Brak produktów przypisanych do tej serii.
      </div>

      <!-- LISTA PRODUKTÓW – ZAWSZE POZIOMO -->
      <div
        v-else
        class="hidden md:block w-full"
      >
        <!-- NAGŁÓWEK KOLUMN -->
        <div class="flex items-center px-4 py-2 text-xs font-semibold text-gray-600 border-b bg-gray-50">
          <div class="w-24 shrink-0">
            Zdjęcie
          </div>
          <div class="flex-1 pl-2">
            Produkt
          </div>
          <div class="w-56 shrink-0 pl-2">
            Parametry
          </div>
          <div class="w-28 shrink-0 pl-2">
            Cena netto
          </div>
          <div class="w-40 shrink-0 pl-2 text-right">
            Do koszyka
          </div>
        </div>

        <!-- WIERSZE -->
        <div
          v-for="product in products"
          :key="product.id"
          class="flex items-center px-4 py-4 border-b"
        >
          <!-- Zdjęcie -->
          <div class="w-24 shrink-0 flex items-center justify-center bg-gray-50 rounded">
            <img
              :src="product.image"
              class="max-w-full max-h-full object-contain"
            >
          </div>

          <!-- Nazwa -->
          <div class="flex-1 pl-4">
            <p class="text-sm font-semibold text-gray-800">
              {{ product.name }}
            </p>
            <p class="text-xs text-gray-500">
              Kod: {{ product.sku }}
            </p>
          </div>

          <!-- Parametry -->
          <div class="w-56 shrink-0 text-xs text-gray-600 space-y-0.5 pl-4">
            <p>Średnica: {{ product.diameter }}</p>
            <p>Wysokość: {{ product.height }}</p>
            <p>Kolor: {{ product.color }}</p>
            <p>Opakowanie: {{ product.packSize }}</p>
          </div>

          <!-- Cena -->
          <div class="w-28 shrink-0 pl-4 text-sm font-semibold text-gray-800">
            {{ product.priceNet.toFixed(2) }} zł
            <span class="text-xs text-gray-500"> / szt.</span>
          </div>

          <!-- Do koszyka -->
          <div class="w-40 shrink-0 pl-4 flex items-center justify-end gap-2">
            <input
              type="number"
              min="1"
              class="w-20 border rounded-lg px-2 py-1 text-sm"
              placeholder="0"
            >
            <button
              class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition"
            >
              Dodaj
            </button>
          </div>
        </div>
      </div>
    </div>
  </UPage>
</template>
