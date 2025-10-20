export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function scrollToElement(element: HTMLElement | null, smooth: boolean = true): void {
  if (!element) return

  const behavior = smooth ? 'smooth' : 'auto'
  element.scrollIntoView({ behavior, block: 'start' })
}

export function scrollToTop(smooth: boolean = true): void {
  const behavior = smooth ? 'smooth' : 'auto'
  window.scrollTo({ top: 0, behavior })
}

export function scrollToBottom(smooth: boolean = true): void {
  const behavior = smooth ? 'smooth' : 'auto'
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior })
}

export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.scrollX || document.documentElement.scrollLeft,
    y: window.scrollY || document.documentElement.scrollTop
  }
}

export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export function observeElement(
  element: HTMLElement,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver(([entry]) => {
    callback(entry.isIntersecting)
  }, options)

  observer.observe(element)

  return () => observer.disconnect()
}

export function requestIdleCallback(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback, 1)
  }
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth

  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

export function isDarkMode(): boolean {
  if (!isBrowser()) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function onDarkModeChange(callback: (isDark: boolean) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent) => callback(e.matches)

  mediaQuery.addEventListener('change', handleChange)

  return () => mediaQuery.removeEventListener('change', handleChange)
}

export function getMetaTag(name: string): string | null {
  const tag = document.querySelector(`meta[name="${name}"]`)
  return tag?.getAttribute('content') || null
}

export function setMetaTag(name: string, content: string): void {
  let tag = document.querySelector(`meta[name="${name}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

export function getFaviconUrl(): string | null {
  const link = document.querySelector('link[rel="icon"]')
  return link?.getAttribute('href') || null
}

export function setFavicon(url: string): void {
  let link = document.querySelector('link[rel="icon"]')

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'icon')
    document.head.appendChild(link)
  }

  link.setAttribute('href', url)
}

export function getPageTitle(): string {
  return document.title
}

export function setPageTitle(title: string): void {
  document.title = title
}

export function focusElement(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    element.focus()
  }
}

export function blurElement(element: HTMLElement | null): void {
  if (element && typeof element.blur === 'function') {
    element.blur()
  }
}

export function preventBodyScroll(): void {
  document.body.style.overflow = 'hidden'
}

export function allowBodyScroll(): void {
  document.body.style.overflow = ''
}

export function addClass(element: HTMLElement | null, className: string): void {
  element?.classList.add(className)
}

export function removeClass(element: HTMLElement | null, className: string): void {
  element?.classList.remove(className)
}

export function toggleClass(element: HTMLElement | null, className: string): void {
  element?.classList.toggle(className)
}

export function hasClass(element: HTMLElement | null, className: string): boolean {
  return element?.classList.contains(className) ?? false
}

export function getTextContent(element: HTMLElement | null): string {
  return element?.textContent || ''
}

export function setTextContent(element: HTMLElement | null, text: string): void {
  if (element) element.textContent = text
}

export function getInnerHTML(element: HTMLElement | null): string {
  return element?.innerHTML || ''
}

export function setInnerHTML(element: HTMLElement | null, html: string): void {
  if (element) element.innerHTML = html
}

export function getAttribute(element: HTMLElement | null, attr: string): string | null {
  return element?.getAttribute(attr) || null
}

export function setAttribute(element: HTMLElement | null, attr: string, value: string): void {
  element?.setAttribute(attr, value)
}

export function removeAttribute(element: HTMLElement | null, attr: string): void {
  element?.removeAttribute(attr)
}

export function getComputedStyle(element: HTMLElement | null, prop: string): string {
  if (!element) return ''
  return window.getComputedStyle(element).getPropertyValue(prop)
}
