// composables/useRemoteTranslations.ts
export const useRemoteTranslations = () => {
  const { locale, t, mergeLocaleMessage } = useI18n()
  const config = useRuntimeConfig()

  // flaga, żeby nie ładować tłumaczeń z API przy każdej nawigacji
  const loadedFromApi = useState<boolean>('i18nLoadedFromApi', () => false)

  const loadTranslations = async () => {
    if (loadedFromApi.value) return

    const currentLocale = locale.value || 'pl'

    try {
      const messages = await $fetch<Record<string, any>>(
        `/translations/${currentLocale}`,
        {
          baseURL: config.public.apiBaseUrl, // <- upewnij się, że tak nazywa się zmienna w nuxt.config
        }
      )

      console.log('🔄 API translations response:', messages)

      if (!messages) return

      console.log('🔍 PRZED merge t(dashboard.home):', t('dashboard.home'))

      // nadpisuje istniejące klucze z plików locale
      mergeLocaleMessage(currentLocale, messages)

      console.log('✅ PO merge t(dashboard.home):', t('dashboard.home'))

      loadedFromApi.value = true
      console.log('✅ i18n: załadowano tłumaczenia z API (locale =', currentLocale, ')')
    } catch (e) {
      console.error('❌ i18n: błąd pobierania tłumaczeń z API', e)
    }
  }

  onMounted(() => {
    loadTranslations()
  })
}
