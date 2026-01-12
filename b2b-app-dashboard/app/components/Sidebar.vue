<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { allCategory } from '~/data/category'
import LogoMini from '~/assets/img/logo_mini.png'

const { t } = useI18n()
const localePath = useLocalePath()

const collapsed = ref(true)

function onEnter() {
  collapsed.value = false
}
function onLeave() {
  collapsed.value = true
}

const items: NavigationMenuItem[] = [{
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
    { label: t('dashboard.products_list'), icon: 'i-lucide-list', to: localePath({ name: 'dashboard-products' }) },
    { label: t('dashboard.product_add'), icon: 'i-lucide-package-plus', to: localePath({ name: 'dashboard-products-add-product' }) },
    { label: t('dashboard.category_add'), icon: 'i-lucide-plus-circle', to: localePath({ name: 'dashboard-products-add-category' }) }
  ]
}, {
  label: t('dashboard.clients'),
  icon: 'i-lucide-users',
  to: localePath({ name: 'dashboard-clients' })
}, {
  label: t('dashboard.marketing'),
  icon: 'i-lucide-megaphone',
  to: localePath({ name: 'dashboard-marketing' })
}, // ✅ NOWE: Moje konto
{
  label: t('dashboard.account'),
  icon: 'i-lucide-user',
  defaultOpen: false,
  children: [
    {
      label: t('dashboard.account_profile'),
      icon: 'i-lucide-id-card',
      to: localePath({ name: 'dashboard-account-profile' })
    },
    {
      label: t('dashboard.account_security'),
      icon: 'i-lucide-shield',
      to: localePath({ name: 'dashboard-account-security' })
    },
    {
      label: t('dashboard.account_data'),
      icon: 'i-lucide-building-2',
      to: localePath({ name: 'dashboard-account-data' })
    }
  ]
},

{
  label: t('dashboard.settings'),
  icon: 'i-lucide-settings',
  defaultOpen: false,
  children: [
    {
      label: t('dashboard.delivery_adress'),
      to: localePath({ name: 'dashboard-settings' })
    },
    {
      label: t('dashboard.admins'),
      to: localePath({ name: 'dashboard-settings-admins' })
    }
  ]
}
]
</script>

<template>
  <!-- fixed + szerokość zależna od collapsed -->
  <div
    class="hidden lg:block fixed left-0 top-0 h-svh z-1000"
    :class="collapsed ? 'w-16' : 'w-72'"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <UDashboardSidebar
      v-model:collapsed="collapsed"
      collapsible
      :ui="{ footer: 'border-t border-default' }"
      class="h-full w-full"
    >
      <template #header>
        <div class="flex items-center justify-center h-(--ui-header-height)">
          <!-- ZWINIĘTE: własne logo -->
          <img
            v-if="collapsed"
            :src="LogoMini"
            alt="Logo Cermax"
            class="h-8 w-auto"
          >

          <!-- ROZWINIĘTE: pełne logo -->
          <AppLogo v-else />
        </div>
      </template>

      <template #default>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
          color="neutral"
          :ui="{ link: 'text-gray-600' }"
        />
      </template>
    </UDashboardSidebar>
  </div>
</template>
