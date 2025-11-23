<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { allCategory } from '~/data/category'
import AppProductSeriesList from '~/components/AppProductSeriesList.vue'

definePageMeta({ layout: 'app' })

const route = useRoute()

const activeCategory = computed(() => route.query.category as string || null)

// nazwa kategorii (lub null)
const categoryName = computed(() => {
  if (!activeCategory.value) return null
  return allCategory.find(cat => cat.categorySlug === activeCategory.value)?.name || null
})
</script>

<template>
  <UPage>
  <h2>Home</h2>
  </UPage>

</template>
