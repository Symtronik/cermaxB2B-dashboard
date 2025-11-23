<script setup lang="ts">
const { t } = useI18n()
const { logout } = useAuth()
const localePath = useLocalePath()
</script>

<template>
  <UHeader
    toggle-side="left"
    title=""
  >
    <template #right>
      <UButton
        icon="i-lucide-package-plus"
        color="primary"
        :to="localePath({ name: 'dashboard-products-add-product' })"
        class="mr-4"
      >
        {{ t('dashboard.product_add') }}
      </UButton>
      <UButton
        color="neutral"
        @click="logout"
      >
        {{ t('dashboard.logout') }}
      </UButton>
    </template>
  </UHeader>
</template>
