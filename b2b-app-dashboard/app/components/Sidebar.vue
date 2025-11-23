<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { allCategory } from '~/data/category'

const { t } = useI18n()
const localePath = useLocalePath()

const categoryItems: NavigationMenuItem[] = allCategory.map(cat => ({
  label: cat.name,
  // dashboard.home = lista produktów, filtr po kategorii w query
  to: localePath({
    name: 'dashboard-products',
    query: { category: cat.categorySlug }
  })
}))

const items: NavigationMenuItem[][] = [[{
  label: t('dashboard.home'),
  icon: 'i-lucide-house',
  to: localePath({ name: 'dashboard' })
}, {
  label: t('dashboard.orders'),
  icon: 'i-lucide-clipboard-list',
  to: localePath({ name: 'dashboard-orders' })
}, {
  label: t('dashboard.products'),
  icon: 'i-lucide-package',
  defaultOpen: false,
  children: [
    {
      label: t('dashboard.products_list'),
      icon: 'i-lucide-list',
      to: localePath({ name: 'dashboard-products' })
    },
    {
      label: t('dashboard.product_add'),
      icon: 'i-lucide-package-plus',
      to: localePath({ name: 'dashboard-products-add-product' })
    },
    {
      label: t('dashboard.category_add'),
      icon: 'i-lucide-plus-circle',
      to: localePath({ name: 'dashboard-products-add-category' })
    }

  ]
}, {
  label: t('dashboard.clients'),
  icon: 'i-lucide-users',
  to: localePath({ name: 'dashboard-history' })
}, {
  label: t('dashboard.marketing'),
  icon: 'i-lucide-megaphone',
  to: localePath({ name: 'dashboard-history' })
}, {
  label: t('dashboard.settings'),
  icon: 'i-lucide-settings',
  defaultOpen: false,
  children: [{
    label: t('dashboard.delivery_adress'),
    to: localePath({ name: 'dashboard-history' })
  }]
}]]
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :ui="{ footer: 'border-t border-default' }"
  >
    <template #header="{ collapsed }">
      <AppLogo />
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[0]"
        orientation="vertical"
        color="neutral"
        :ui="{ link: 'text-gray-600' } "
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        color="neutral"
      />
    </template>
  </UDashboardSidebar>
</template>
