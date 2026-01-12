// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // prywatne zmienne (tylko serwer)
    apiSecret: '',
    // publiczne zmienne (widoczne w kodzie klienta)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/',
      cookieSecure: process.env.NUXT_PUBLIC_COOKIE_SECURE === 'false',
      cookieMaxAge: Number(process.env.NUXT_PUBLIC_COOKIE_MAX_AGE) || 0
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      { code: 'pl', name: 'Polski', language: 'pl-PL', file: 'pl.json' },
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' }
    ],
    defaultLocale: 'pl',
    strategy: 'prefix_except_default', // / (pl) i /en/...
    detectBrowserLanguage: { useCookie: true, cookieKey: 'i18n_redirected' }
  }

})
