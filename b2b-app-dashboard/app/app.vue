<!-- app.vue -->
<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.png' }],
  htmlAttrs: { lang: 'pl' }
})

const title = 'Panel B2B Cermax'
const description = ''

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/og.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :locale="locales[locale]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
