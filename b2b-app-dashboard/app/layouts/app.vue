<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'

const mobileOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->

    <Sidebar />

    <!-- Główna część -->
    <div class="flex-1 min-w-0 flex flex-col bg-gray-50 dark:bg-gray-950">
      <!-- Topbar przyklejony u góry -->
      <AppTopbar class="sticky top-0 z-20" />

      <!-- Scrollowalna zawartość strony -->
      <main class="flex-1 overflow-auto">
        <UContainer class="py-6">
          <slot />
        </UContainer>
      </main>
      <Footer />
    </div>
  </div>
</template>
