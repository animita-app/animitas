export function clearAuthCookies() {
  const cookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    "sb-lqkwpjkibpkfoilfpfxz-auth-token",
    "sb-lqkwpjkibpkfoilfpfxz-auth-token.0",
    "sb-lqkwpjkibpkfoilfpfxz-auth-token.1",
    "sb-lqkwpjkibpkfoilfpfxz-auth-token.2",
  ]

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
  })

  localStorage.removeItem("supabase.auth.token")
  sessionStorage.removeItem("supabase.auth.token")

  Object.keys(localStorage).forEach((key) => {
    if (key.includes("supabase") || key.includes("auth")) {
      localStorage.removeItem(key)
    }
  })
}
