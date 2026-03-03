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

export function addClearCacheButton() {
  const existing = document.getElementById("clear-auth-cache-btn")
  if (existing) return

  const btn = document.createElement("button")
  btn.id = "clear-auth-cache-btn"
  btn.textContent = "🔄 Clear Cache"
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 12px;
    background: #00e;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    z-index: 9999;
    opacity: 0.7;
  `

  btn.onclick = () => {
    clearAuthCookies()
    location.reload()
  }

  document.body.appendChild(btn)
}
