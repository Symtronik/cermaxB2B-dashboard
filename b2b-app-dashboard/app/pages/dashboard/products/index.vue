<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { SelectMenuItem } from '@nuxt/ui'
import { allCategory } from '~/data/category'
import AppProductSeriesList from '~/components/AppProductSeriesList.vue'

definePageMeta({ layout: 'app' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n() // 👈 i18n

const ALL = 'all'

// aktualna kategoria z URL (?category=...)
const activeCategory = computed(() => route.query.category as string || null)

// nazwa kategorii do nagłówka
const categoryName = computed(() => {
  if (!activeCategory.value) return null
  return allCategory.find(cat => cat.categorySlug === activeCategory.value)?.name || null
})

// USelectMenu oczekuje `items`
const categoryItems = computed<SelectMenuItem[]>(() => [
  {
    label: t('dashboard.all_categories'), // 👈 i18n
    id: ALL
  },
  ...allCategory.map(cat => ({
    label: cat.name, // nazwy kategorii masz już po PL w danych
    id: cat.categorySlug
  }))
])

// v-model – trzymamy samo `id` (ALL lub categorySlug)
const selectedCategory = ref<string>(activeCategory.value || ALL)

// gdy zmienia się URL (np. klik z sidebaru) – synchronizujemy select
watch(
  () => route.query.category,
  (val) => {
    selectedCategory.value = (val as string) || ALL
  }
)

// gdy zmienia się wartość w select – aktualizujemy URL
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
</script>

<template>
  <UPage>
    <!-- STICKY pasek filtrów nad listą -->
    <div class="sticky top-0 z-20 mb-6 bg-white/80 backdrop-blur">
      <UCard class="border border-gray-200 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <!-- Lewa strona: tytuł -->
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-sm">
                <UIcon name="i-lucide-filter" />
              </span>
              <h1 class="text-xl font-semibold">
                {{ categoryName || t('dashboard.all_products') }}
              </h1>
            </div>
          </div>

          <!-- Prawa strona: select + przycisk wyczyszczenia -->
          <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center lg:min-w-[380px]">
            <div class="w-full">
              <USelectMenu
                v-model="selectedCategory"
                :items="categoryItems"
                value-key="id"
                :placeholder="t('dashboard.filter_by_category_placeholder')"
                size="lg"
              />
            </div>

            <UButton
              variant="ghost"
              size="lg"
              class="whitespace-nowrap self-end sm:self-auto"
              @click="selectedCategory = ALL"
            >
              <UIcon name="i-lucide-x-circle" class="mr-1" />
              {{ t('dashboard.clear_filter') }}
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Lista serii -->
    <AppProductSeriesList
      :category="activeCategory"
    />
  </UPage>
</template>
