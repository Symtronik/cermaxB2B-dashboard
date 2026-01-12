<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'
import MobileBottomNav from '~/components/MobileBottomNav.vue'

useRemoteTranslations()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="flex min-h-screen">
      <!-- Sidebar tylko na desktop -->
      <div class="hidden lg:block">
        <Sidebar />
      </div>

      <!-- Główna część -->
      <div class="flex-1 min-w-0 flex flex-col">
        <!-- desktop topbar -->
        <AppTopbar class="sticky top-0 z-40 hidden lg:block" />

        <!-- mobile: daj mały top padding, a dół większy (safe-area) -->
        <main class="flex-1 overflow-auto pt-3 lg:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
          <!-- na mobile mniejszy vertical padding -->
          <UContainer class="py-4 lg:py-6">
            <slot />
          </UContainer>
        </main>

        <div class="hidden lg:block">
          <Footer />
        </div>
      </div>
    </div>

    <!-- Bottom nav tylko na mobile -->
    <MobileBottomNav />
  </div>
</template>
