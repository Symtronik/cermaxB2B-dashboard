<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { allSeries } from '~/data/allSeries'

// przyjmujemy kategorię, tytuł i tekst wyszukiwania jako props
const props = defineProps<{
  category?: string | null
  title?: string | null
  search?: string | null
}>()

const perPage = 20
const page = ref(1)

// Filtrowanie serii po kategorii i nazwie
const filteredSeries = computed(() => {
  let list = allSeries

  // filtr po kategorii
  if (props.category) {
    list = list.filter(s => s.categorySlug === props.category)
  }

  // filtr po nazwie serii (search)
  if (props.search) {
    const term = props.search.toLowerCase().trim()
    if (term) {
      list = list.filter(s => s.name.toLowerCase().includes(term))
    }
  }

  return list
})

// Paginacja na podstawie przefiltrowanych serii
const visibleSeries = computed(() =>
  filteredSeries.value.slice(0, page.value * perPage)
)

const hasMore = computed(
  () => visibleSeries.value.length < filteredSeries.value.length
)

const loadMore = () => {
  if (!hasMore.value) return
  page.value++
}

// Po zmianie kategorii lub wyszukiwanej frazy resetujemy stronę na 1
watch(
  () => [props.category, props.search],
  () => {
    page.value = 1
  }
)
</script>

<template>
  <div class="p-4 sm:p-8">
    <!-- Brak serii po filtrowaniu -->
    <div
      v-if="!filteredSeries.length"
      class="text-sm text-gray-500"
    >
      {{ props.title || 'Brak serii w tej kategorii.' }}
    </div>

    <!-- Lista kart -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="item in visibleSeries"
        :key="item.id"
        :to="`/dashboard/products/${item.slug}`"
        class="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <div class="aspect-[4/3] overflow-hidden flex items-center justify-center">
          <img
            :src="item.image"
            :alt="item.name"
            class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
          >
        </div>

        <div class="p-4 text-center">
          <p class="text-base font-semibold text-gray-700 group-hover:text-black group-hover:underline">
            {{ item.name }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- Przyciski pod listą -->
    <div
      v-if="filteredSeries.length"
      class="flex justify-center items-center py-6"
    >
      <button
        v-if="hasMore"
        class="px-6 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-95 transition"
        @click="loadMore"
      >
        Wczytaj więcej
      </button>
      <span
        v-else
        class="text-sm text-gray-400"
      >
        Wyświetlono wszystkie serie
      </span>
    </div>
  </div>
</template>
