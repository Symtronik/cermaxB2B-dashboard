export default defineNuxtPlugin((nuxtApp) => {
  // ofetch hook – przed każdym requestem
  nuxtApp.$fetch = $fetch.create({
    onRequest({ options }) {
      const token = useCookie('auth_token').value
      if (token) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      }
    }
  })
})
