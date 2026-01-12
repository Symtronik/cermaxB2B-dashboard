<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { SelectMenuItem } from '@nuxt/ui'
import { allCategory } from '~/data/category'
import { allSeries } from '~/data/allSeries'
import AppProductSeriesList from '~/components/AppProductSeriesList.vue'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const ALL = 'all'

// aktualna kategoria z URL (?category=...)
const activeCategory = computed(() => route.query.category as string || null)

// nazwa kategorii do nagłówka
const categoryName = computed(() => {
  if (!activeCategory.value) return null
  return allCategory.find(cat => cat.categorySlug === activeCategory.value)?.name || null
})

// USelectMenu -> items
const categoryItems = computed<SelectMenuItem[]>(() => [
  {
    label: t('dashboard.all_categories'),
    id: ALL
  },
  ...allCategory.map(cat => ({
    label: cat.name,
    id: cat.categorySlug
  }))
])

// v-model kategorii
const selectedCategory = ref<string>(activeCategory.value || ALL)

// synchronizacja z URL
watch(
  () => route.query.category,
  (val) => {
    selectedCategory.value = (val as string) || ALL
  }
)

// aktualizacja URL po zmianie w select
watch(
  () => selectedCategory.value,
  (value) => {
    const category = value === ALL ? undefined : value

    router.push({
      name: route.name as string,
      query: {
        ...route.query,
        category
      }
    })
  }
)

// 🔎 wyszukiwanie po nazwie serii
const searchSeries = ref('')

// podpowiedzi serii pod polem wyszukiwania
const seriesSuggestions = computed(() => {
  const term = searchSeries.value.toLowerCase().trim()
  if (!term) return []

  return allSeries
    .filter(s => {
      const matchName = s.name.toLowerCase().includes(term)
      const matchCategory = !activeCategory.value || s.categorySlug === activeCategory.value
      return matchName && matchCategory
    })
    .slice(0, 6)
    .map(s => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      categoryName: allCategory.find(c => c.categorySlug === s.categorySlug)?.name || ''
    }))
})

const goToSeries = (serie: { slug: string }) => {
  router.push(`/dashboard/products/${serie.slug}`)
}

// 🌟 info o aktywnych filtrach
const hasCategoryFilter = computed(() => selectedCategory.value !== ALL)
const hasSearchFilter = computed(() => searchSeries.value.trim().length > 0)
const hasAnyFilter = computed(() => hasCategoryFilter.value || hasSearchFilter.value)

const resetFilters = () => {
  selectedCategory.value = ALL
  searchSeries.value = ''
}
</script>

<template>
  <UPage>
    <!-- Pasek filtrów nad listą -->
    <div class="sticky top-0 z-50 mb-6 bg-gradient-to-b from-white via-white/90 to-transparent backdrop-blur">
      <UCard class="relative border-none shadow-sm ring-1 ring-gray-200/80 rounded-2xl overflow-visible">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <!-- Lewa strona: tytuł + info o filtrach -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-900 text-white text-sm">
                <UIcon name="i-lucide-filter" />
              </span>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold">
                  {{ categoryName || t('dashboard.all_products') }}
                </h1>
                <p class="text-[11px] text-gray-500 mt-0.5">
                  {{ t('dashboard.products_filters_subtitle') }}
                </p>
              </div>
            </div>

            <!-- Chipsy aktywnych filtrów -->
            <div
              v-if="hasAnyFilter"
              class="flex flex-wrap gap-1.5 pl-11"
            >
              <span
                v-if="hasCategoryFilter"
                class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-700"
              >
                <UIcon name="i-lucide-package-open" class="text-[13px]" />
                <span>{{ t('dashboard.filter_chip_category') }}:</span>
                <span class="font-medium">
                  {{ categoryName }}
                </span>
              </span>

              <span
                v-if="hasSearchFilter"
                class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-700"
              >
                <UIcon name="i-lucide-search" class="text-[13px]" />
                <span>{{ t('dashboard.filter_chip_search') }}:</span>
                <span class="font-medium">
                  “{{ searchSeries }}”
                </span>
              </span>
            </div>
          </div>

          <!-- Prawa strona: kategoria + wyszukiwarka serii -->
          <div class="flex flex-col gap-2 w-full lg:max-w-xl">
            <!-- Główna linia filtrów -->
            <div class="flex flex-col sm:flex-row gap-2">
              <USelectMenu
                v-model="selectedCategory"
                :items="categoryItems"
                value-key="id"
                :placeholder="t('dashboard.filter_by_category_placeholder')"
                size="lg"
                class="flex-1"
              />

              <!-- 👇 ważne: relative + wysoki z-index -->
              <div class="relative flex-1 z-50">
                <UInput
                  v-model="searchSeries"
                  :placeholder="t('dashboard.series_search_placeholder')"
                  icon="i-lucide-search"
                  size="lg"
                />

                <!-- Podpowiedzi -->
                <div
                  v-if="searchSeries && seriesSuggestions.length"
                  class="absolute left-0 right-0 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto z-[60]"
                >
                  <button
                    v-for="serie in seriesSuggestions"
                    :key="serie.id"
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    @click="goToSeries(serie)"
                  >
                    <span class="font-medium truncate">
                      {{ serie.name }}
                    </span>
                    <span class="text-[11px] text-gray-400 ml-2 truncate">
                      {{ serie.categoryName }}
                    </span>
                  </button>
                </div>

                <div
                  v-else-if="searchSeries && !seriesSuggestions.length"
                  class="absolute left-0 right-0 mt-1 w-full rounded-xl border border-dashed border-gray-200 bg-white text-[11px] text-gray-400 px-3 py-2 z-[60]"
                >
                  {{ t('dashboard.series_search_empty') }}
                </div>
              </div>
            </div>

            <!-- Dolna linia: info + wyczyszczenie -->
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>
                <span class="font-medium">{{ t('dashboard.filters_label') }}:</span>
                <span>
                  {{
                    hasAnyFilter
                      ? t('dashboard.filters_active')
                      : t('dashboard.filters_none')
                  }}
                </span>
              </span>

              <button
                type="button"
                class="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-900 hover:underline"
                @click="resetFilters"
              >
                <UIcon name="i-lucide-rotate-ccw" class="text-[13px]" />
                {{ t('dashboard.filters_reset_all') }}
              </button>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Lista serii (filtrowana też po searchSeries) -->
    <AppProductSeriesList
      :category="activeCategory"
      :search="searchSeries"
    />
  </UPage>
</template>

