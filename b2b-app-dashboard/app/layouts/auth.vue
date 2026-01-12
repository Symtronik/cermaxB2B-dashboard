<script setup lang="ts">
useRemoteTranslations()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- środek strony (tu będą karty logowania/forgot) -->
    <main class="flex flex-1 items-center justify-center px-4">
      <slot />
    </main>

    <!-- footer zawsze na dole -->
    <Footer />
  </div>
</template>
