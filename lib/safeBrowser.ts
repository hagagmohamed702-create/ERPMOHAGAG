/**
 * Safe browser utilities to prevent SSR issues
 */

export const isBrowser = () => typeof window !== 'undefined'

export const safeLocalStorage = {
  getItem: (key: string, defaultValue: string = '') => {
    if (!isBrowser()) return defaultValue
    try {
      return localStorage.getItem(key) || defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },
  
  setItem: (key: string, value: string) => {
    if (!isBrowser()) return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },
  
  removeItem: (key: string) => {
    if (!isBrowser()) return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }
}

export const safeWindow = {
  addEventListener: (event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) => {
    if (!isBrowser()) return
    window.addEventListener(event, handler, options)
  },
  
  removeEventListener: (event: string, handler: EventListener, options?: boolean | EventListenerOptions) => {
    if (!isBrowser()) return
    window.removeEventListener(event, handler, options)
  },
  
  location: {
    get href() {
      return isBrowser() ? window.location.href : ''
    },
    set href(url: string) {
      if (isBrowser()) window.location.href = url
    },
    get pathname() {
      return isBrowser() ? window.location.pathname : '/'
    }
  }
}

export const safeDocument = {
  querySelector: <T extends Element>(selector: string): T | null => {
    if (!isBrowser()) return null
    return document.querySelector<T>(selector)
  },
  
  getElementById: (id: string): HTMLElement | null => {
    if (!isBrowser()) return null
    return document.getElementById(id)
  }
}