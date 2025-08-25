import { isBrowser } from '@/lib/env/safe'

/**
 * Get today's date in YYYY-MM-DD format
 * Returns a stable date for SSR to prevent hydration mismatch
 */
export function getTodayDateString(): string {
  // Return a stable date for SSR
  if (!isBrowser()) {
    return '2024-01-01'
  }
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current date object
 * Returns a stable date for SSR
 */
export function getCurrentDate(): Date {
  if (!isBrowser()) {
    return new Date('2024-01-01')
  }
  return new Date()
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  if (!isBrowser()) {
    return 2024
  }
  return new Date().getFullYear()
}

/**
 * Get current month (1-12)
 */
export function getCurrentMonth(): number {
  if (!isBrowser()) {
    return 1
  }
  return new Date().getMonth() + 1
}