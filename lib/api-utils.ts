// Utility function to safely parse API responses
export async function parseApiResponse(response: Response) {
  try {
    const text = await response.text()
    
    // Try to parse as JSON
    try {
      return JSON.parse(text)
    } catch {
      // If not JSON, return an error object
      return {
        error: 'Invalid response format',
        message: text || 'حدث خطأ في الخادم'
      }
    }
  } catch (error) {
    return {
      error: 'Failed to read response',
      message: 'حدث خطأ في قراءة الاستجابة'
    }
  }
}

// Common error handler for form submissions
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  return 'حدث خطأ غير متوقع'
}

// Clean form data - remove empty strings and undefined values
export function cleanFormData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {}
  
  Object.entries(data).forEach(([key, value]) => {
    // Only include non-empty values
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value
    }
    // Don't include empty strings or undefined values at all
  })
  
  return cleaned
}

// Prepare form data for submission
export function prepareFormData(data: Record<string, any>): Record<string, any> {
  const prepared: Record<string, any> = {}
  
  Object.entries(data).forEach(([key, value]) => {
    // Convert empty strings to null for optional fields
    if (value === '') {
      // Skip empty values entirely
      return
    }
    
    // Handle specific conversions
    if (key === 'percentage' || key === 'budget' || key === 'price' || key === 'area' || key === 'amount' || key === 'salary' || key === 'totalAmount' || key === 'downPayment' || key === 'discount' || key === 'commission' || key === 'minQuantity' || key === 'basicSalary' || key === 'allowances' || key === 'deductions' || key === 'quantity') {
      if (value) {
        prepared[key] = parseFloat(value)
      }
    } else if (key === 'floor' || key === 'totalUnits' || key === 'months' || key === 'month' || key === 'year') {
      if (value) {
        prepared[key] = parseInt(value)
      }
    } else {
      prepared[key] = value
    }
  })
  
  return prepared
}