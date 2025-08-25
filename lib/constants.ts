/**
 * Constants used across the application
 */

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  if (typeof window === 'undefined') {
    // Return a fixed date for SSR
    return '2024-01-01'
  }
  return new Date().toISOString().split('T')[0]
}

// Get current year
export const getCurrentYear = () => {
  if (typeof window === 'undefined') {
    return 2024
  }
  return new Date().getFullYear()
}

// Get current month (1-12)
export const getCurrentMonth = () => {
  if (typeof window === 'undefined') {
    return 1
  }
  return new Date().getMonth() + 1
}