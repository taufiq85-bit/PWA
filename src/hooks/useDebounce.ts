// src/hooks/useDebounce.ts
import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook that debounces a value - useful for search inputs, API calls, etc.
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function that will cancel the timeout if value or delay changes
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that debounces a callback function
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array (like useCallback)
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fixed: Removed spread element from dependency array and used useMemo-like pattern
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    // Fixed: Create a stable reference for deps to avoid spread element warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, deps.join(',')]
  ) as T

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Advanced debounce hook with additional controls
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @param options - Additional options
 * @returns Object with debounced value and control functions
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean // Execute immediately on first call
    maxWait?: number // Maximum time to wait
  } = {}
) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallTimeRef = useRef<number>(0)
  const hasExecutedRef = useRef<boolean>(false)

  const { leading = false, maxWait } = options

  useEffect(() => {
    const currentTime = Date.now()

    // Execute immediately if leading is true and this is the first call
    if (leading && !hasExecutedRef.current) {
      setDebouncedValue(value)
      hasExecutedRef.current = true
      lastCallTimeRef.current = currentTime
      return
    }

    setIsDebouncing(true)

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current)
    }

    // Set normal debounce timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
      setIsDebouncing(false)
      hasExecutedRef.current = false
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current)
        maxTimeoutRef.current = null
      }
    }, delay)

    // Set max wait timeout if specified
    if (maxWait && currentTime - lastCallTimeRef.current >= maxWait) {
      maxTimeoutRef.current = setTimeout(
        () => {
          setDebouncedValue(value)
          setIsDebouncing(false)
          hasExecutedRef.current = false
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          lastCallTimeRef.current = Date.now()
        },
        maxWait - (currentTime - lastCallTimeRef.current)
      )
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current)
      }
    }
  }, [value, delay, leading, maxWait])

  // Manual trigger function
  const trigger = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current)
    }
    setDebouncedValue(value)
    setIsDebouncing(false)
    hasExecutedRef.current = false
  }, [value])

  // Cancel pending debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current)
    }
    setIsDebouncing(false)
    hasExecutedRef.current = false
  }, [])

  return {
    debouncedValue,
    isDebouncing,
    trigger,
    cancel,
  }
}

/**
 * Hook for debounced search functionality
 * @param initialValue - Initial search value
 * @param delay - Debounce delay
 * @returns Object with search state and functions
 */
export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  // Track when search is happening
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [searchTerm, debouncedSearchTerm])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const hasSearchTerm = debouncedSearchTerm.trim().length > 0

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    isSearching,
    hasSearchTerm,
  }
}

/**
 * Hook for debounced form validation
 * @param formData - Form data object
 * @param validationFn - Validation function
 * @param delay - Debounce delay
 * @returns Validation results
 */
export function useDebouncedValidation<T extends Record<string, unknown>>(
  formData: T,
  validationFn: (data: T) => Record<keyof T, string | null>,
  delay = 500
) {
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    {} as Record<keyof T, string | null>
  )
  const [isValidating, setIsValidating] = useState(false)

  const debouncedFormData = useDebounce(formData, delay)

  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(debouncedFormData)) {
      setIsValidating(true)
    } else {
      setIsValidating(false)

      // Run validation
      try {
        const validationErrors = validationFn(debouncedFormData)
        setErrors(validationErrors)
      } catch (error) {
        console.error('Validation error:', error)
      }
    }
  }, [formData, debouncedFormData, validationFn])

  const isValid = Object.values(errors).every((error) => !error)
  const hasErrors = Object.values(errors).some((error) => Boolean(error))

  return {
    errors,
    isValid,
    hasErrors,
    isValidating,
  }
}

/**
 * Hook for debounced API calls
 * @param apiCall - Function that makes the API call
 * @param delay - Debounce delay
 * @returns Object with API call function and state
 */
export function useDebouncedApi<T, P extends unknown[]>(
  apiCall: (...params: P) => Promise<T>,
  delay = 300
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedApiCall = useDebouncedCallback(
    async (...params: unknown[]) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall(...(params as P))
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    delay,
    [apiCall]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    call: debouncedApiCall,
    reset,
  }
}
