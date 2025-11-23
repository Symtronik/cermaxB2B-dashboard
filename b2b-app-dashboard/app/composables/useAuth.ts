export function useAuth() {
  const token = useCookie<string | null>('auth_token')
  const user = useState('auth_user', () => null as null | {
    id: number; name: string; email: string; roles?: string[]
  })

  const isAuthenticated = computed(() => !!token.value)

  const logout = async () => {
    token.value = null
    user.value = null
    if (process.client) localStorage.removeItem('auth_token')
    await navigateTo('/')
  }

  return { isAuthenticated, user, logout }
}
