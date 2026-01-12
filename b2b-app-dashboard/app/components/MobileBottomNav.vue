<script setup lang="ts">
import { allCategory } from '~/data/category'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// zawsze string
const tr = (key: string) => String(t(key))

const open = ref(false)

// stabilne klucze dla accordionów
type GroupKey = 'products' | 'account' | 'settings'
const openGroups = ref<Record<GroupKey, boolean>>({
  products: false,
  account: false,
  settings: false
})

function close() {
  open.value = false
}

/**
 * ✅ Poprawione active:
 * - /dashboard (Start) tylko exact
 * - reszta: exact lub podścieżki
 */
function isActive(to?: any) {
  if (!to) return false

  const path = typeof to === 'string' ? to : (to?.path ?? '')
  if (!path) return false

  // Home /dashboard tylko jeśli jesteś dokładnie na /dashboard
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }

  return route.path === path || route.path.startsWith(path + '/')
}

function toggleGroup(key: GroupKey) {
  openGroups.value[key] = !openGroups.value[key]
}

function syncOpenGroupsToRoute() {
  const path = route.path
  openGroups.value.products = path.includes('/dashboard/products')
  openGroups.value.account = path.includes('/dashboard/account')
  openGroups.value.settings = path.includes('/dashboard/settings')
}

// auto-open tylko przy otwieraniu
watch(open, (v) => {
  if (v) syncOpenGroupsToRoute()
})

// jeśli menu jest otwarte i zmienisz route, utrzymaj spójność
watch(
  () => route.path,
  () => {
    if (open.value) syncOpenGroupsToRoute()
  }
)

type MobileNavItem = {
  key: string
  text: string
  icon?: string
  to?: any
  groupKey?: GroupKey
  children?: MobileNavItem[]
}

const items: MobileNavItem[] = [
  {
    key: 'home',
    text: tr('dashboard.home'),
    icon: 'i-lucide-house',
    to: localePath({ name: 'dashboard' })
  },
  {
    key: 'orders',
    text: tr('dashboard.orders'),
    icon: 'i-lucide-clipboard-list',
    to: localePath({ name: 'dashboard-orders' })
  },
  {
    key: 'products',
    text: tr('dashboard.products'),
    icon: 'i-lucide-package',
    groupKey: 'products',
    children: [
      {
        key: 'products-list',
        text: tr('dashboard.products_list'),
        icon: 'i-lucide-list',
        to: localePath({ name: 'dashboard-products' })
      },
      {
        key: 'products-add',
        text: tr('dashboard.product_add'),
        icon: 'i-lucide-package-plus',
        to: localePath({ name: 'dashboard-products-add-product' })
      },
      {
        key: 'category-add',
        text: tr('dashboard.category_add'),
        icon: 'i-lucide-plus-circle',
        to: localePath({ name: 'dashboard-products-add-category' })
      }
    ]
  },
  {
    key: 'clients',
    text: tr('dashboard.clients'),
    icon: 'i-lucide-users',
    to: localePath({ name: 'dashboard-clients' })
  },
  {
    key: 'marketing',
    text: tr('dashboard.marketing'),
    icon: 'i-lucide-megaphone',
    to: localePath({ name: 'dashboard-marketing' })
  },
  {
    key: 'account',
    text: tr('dashboard.account'),
    icon: 'i-lucide-user',
    groupKey: 'account',
    children: [
      {
        key: 'account-profile',
        text: tr('dashboard.account_profile'),
        icon: 'i-lucide-id-card',
        to: localePath({ name: 'dashboard-account-profile' })
      },
      {
        key: 'account-security',
        text: tr('dashboard.account_security'),
        icon: 'i-lucide-shield',
        to: localePath({ name: 'dashboard-account-security' })
      },
      {
        key: 'account-data',
        text: tr('dashboard.account_data'),
        icon: 'i-lucide-building-2',
        to: localePath({ name: 'dashboard-account-data' })
      }
    ]
  },
  {
    key: 'settings',
    text: tr('dashboard.settings'),
    icon: 'i-lucide-settings',
    groupKey: 'settings',
    children: [
      {
        key: 'delivery-address',
        text: tr('dashboard.delivery_adress'),
        icon: 'i-lucide-map-pin',
        to: localePath({ name: 'dashboard-settings' })
      }
    ]
  }
]

// szybkie akcje w dolnym pasku
const quickActions = computed(() => ([
  {
    key: 'add-product',
    icon: 'i-lucide-package-plus',
    to: localePath({ name: 'dashboard-products-add-product' }),
    label: tr('dashboard.product_add')
  },
  {
    key: 'orders',
    icon: 'i-lucide-clipboard-list',
    to: localePath({ name: 'dashboard-orders' }),
    label: tr('dashboard.orders')
  }
]))
</script>

<template>
  <div class="lg:hidden">
    <ClientOnly>
      <Teleport to="body">
        <!-- overlay -->
        <div
          v-show="open"
          class="fixed inset-0 z-50 bg-black/40"
          @click="close"
        />

        <!-- bottom sheet -->
        <div
          class="fixed inset-x-0 bottom-0 z-[60] transition-transform duration-200"
          :class="open ? 'translate-y-0' : 'translate-y-full'"
          style="padding-bottom: env(safe-area-inset-bottom);"
        >
          <div class="bg-white dark:bg-gray-900 rounded-t-2xl border-t border-gray-200 dark:border-gray-800 shadow-2xl">
            <!-- header -->
            <div class="px-4 pt-3 pb-2">
              <div class="mx-auto h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div class="mt-3 flex items-center justify-between">
                <span class="font-semibold">
                  {{ tr('dashboard.menu') || 'Menu' }}
                </span>
                <UButton variant="ghost" icon="i-lucide-x" @click="close" />
              </div>
            </div>

            <!-- menu list -->
            <div class="px-2 pb-3">
              <div v-for="it in items" :key="it.key">
                <NuxtLink
                  v-if="!it.children?.length"
                  :to="it.to"
                  class="flex items-center gap-3 px-3 py-3 rounded-lg"
                  :class="isActive(it.to)
                    ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'"
                  @click="close"
                >
                  <UIcon v-if="it.icon" :name="it.icon" class="size-5" />
                  <span class="text-sm font-medium">{{ it.text }}</span>
                </NuxtLink>

                <button
                  v-else
                  type="button"
                  class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  @click="toggleGroup(it.groupKey!)"
                >
                  <UIcon v-if="it.icon" :name="it.icon" class="size-5" />
                  <span class="text-sm font-medium flex-1 text-left">{{ it.text }}</span>
                  <UIcon
                    :name="openGroups[it.groupKey!] ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                    class="size-5 opacity-70"
                  />
                </button>

                <div
                  v-if="it.children?.length"
                  v-show="openGroups[it.groupKey!]"
                  class="ml-9 mr-2 mb-2 border-l border-gray-200 dark:border-gray-800"
                >
                  <NuxtLink
                    v-for="child in it.children"
                    :key="child.key"
                    :to="child.to"
                    class="flex items-center gap-3 px-3 py-2 rounded-md ml-2 my-1 text-sm"
                    :class="isActive(child.to)
                      ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'"
                    @click="close"
                  >
                    <UIcon v-if="child.icon" :name="child.icon" class="size-4" />
                    <span>{{ child.text }}</span>
                  </NuxtLink>
                </div>
              </div>

              <div class="mt-2 px-3">
                <slot name="more" />
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </ClientOnly>

    <!-- dolny pasek -->
    <nav
      class="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <div class="h-16 px-2 flex items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          size="lg"
          icon="i-lucide-menu"
          class="shrink-0"
          @click="open = true"
        >
          {{ tr('dashboard.menu') || 'Menu' }}
        </UButton>

        <div class="flex-1" />

        <NuxtLink
          v-for="a in quickActions"
          :key="a.key"
          :to="a.to"
          class="inline-flex items-center justify-center w-12 h-12 rounded-lg transition"
          :class="isActive(a.to)
            ? 'bg-gray-100 dark:bg-gray-800 text-primary'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
          @click="close"
        >
          <UIcon :name="a.icon" class="size-6" />
          <span class="sr-only">{{ a.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
