export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('auth_token').value
  if (!token) return navigateTo('/')
})
