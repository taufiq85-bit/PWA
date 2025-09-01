// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react'

// Type definitions
type SetValue<T> = T | ((val: T) => T)

interface UseLocalStorageReturn<T> {
  storedValue: T
  setValue: (value: SetValue<T>) => void
  removeValue: () => void
  loading: boolean
  error: string | null
}

/**
 * Custom hook for managing localStorage with React state synchronization
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 * @returns object with storedValue, setValue, removeValue, loading, error
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Get value from localStorage on mount
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      if (typeof window === 'undefined') {
        setStoredValue(initialValue)
        setLoading(false)
        return
      }

      const item = window.localStorage.getItem(key)
      if (item === null) {
        setStoredValue(initialValue)
      } else {
        const parsed = JSON.parse(item)
        setStoredValue(parsed)
      }
    } catch (err) {
      console.error(`Error reading localStorage key "${key}":`, err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStoredValue(initialValue)
    } finally {
      setLoading(false)
    }
  }, [key, initialValue])

  // Set value to localStorage and state
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setError(null)

        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        setStoredValue(valueToStore)

        // Save to localStorage
        if (typeof window !== 'undefined') {
          if (valueToStore === undefined) {
            window.localStorage.removeItem(key)
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
          }
        }

        // Dispatch custom event for cross-tab synchronization
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('localStorageChange', {
            detail: { key, newValue: valueToStore },
          })
          window.dispatchEvent(event)
        }
      } catch (err) {
        console.error(`Error setting localStorage key "${key}":`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    },
    [key, storedValue]
  )

  // Remove value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      setError(null)
      setStoredValue(initialValue)

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }

      // Dispatch custom event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('localStorageChange', {
          detail: { key, newValue: undefined },
        })
        window.dispatchEvent(event)
      }
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [key, initialValue])

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key === key) {
        try {
          if (e.newValue === null) {
            setStoredValue(initialValue)
          } else {
            setStoredValue(JSON.parse(e.newValue))
          }
        } catch (err) {
          console.error('Error parsing localStorage change:', err)
        }
      } else if ('detail' in e && e.detail.key === key) {
        setStoredValue(e.detail.newValue ?? initialValue)
      }
    }

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange)
    // Listen for changes from current tab
    window.addEventListener(
      'localStorageChange',
      handleStorageChange as EventListener
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'localStorageChange',
        handleStorageChange as EventListener
      )
    }
  }, [key, initialValue])

  return {
    storedValue,
    setValue,
    removeValue,
    loading,
    error,
  }
}

// Utility hook for boolean localStorage values
export function useLocalStorageBoolean(key: string, initialValue = false) {
  const { storedValue, setValue, removeValue, loading, error } =
    useLocalStorage(key, initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [setValue])

  return {
    value: storedValue,
    setValue,
    toggle,
    removeValue,
    loading,
    error,
  }
}

// Utility hook for array localStorage values
export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  const { storedValue, setValue, removeValue, loading, error } =
    useLocalStorage(key, initialValue)

  const addItem = useCallback(
    (item: T) => {
      setValue((prev) => [...prev, item])
    },
    [setValue]
  )

  const removeItem = useCallback(
    (index: number) => {
      setValue((prev) => prev.filter((_, i) => i !== index))
    },
    [setValue]
  )

  const updateItem = useCallback(
    (index: number, item: T) => {
      setValue((prev) =>
        prev.map((existingItem, i) => (i === index ? item : existingItem))
      )
    },
    [setValue]
  )

  const clearArray = useCallback(() => {
    setValue([])
  }, [setValue])

  return {
    items: storedValue,
    setItems: setValue,
    addItem,
    removeItem,
    updateItem,
    clearArray,
    removeValue,
    loading,
    error,
  }
}

// Hook for managing user preferences
export function useLocalStoragePreferences() {
  const defaultPreferences = {
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'id',
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    dashboard: {
      layout: 'grid' as 'grid' | 'list',
      density: 'comfortable' as 'comfortable' | 'compact',
    },
  }

  return useLocalStorage('user_preferences', defaultPreferences)
}

// Hook for managing recently viewed items
export function useLocalStorageRecent<T extends { id: string; name: string }>(
  key: string,
  maxItems = 10
) {
  const {
    items: storedValue,
    setItems: setValue,
    removeValue,
    loading,
    error,
  } = useLocalStorageArray<T>(key, [])

  const addRecentItem = useCallback(
    (item: T) => {
      setValue((prev) => {
        const filtered = prev.filter(
          (existingItem) => existingItem.id !== item.id
        )
        const updated = [item, ...filtered]
        return updated.slice(0, maxItems)
      })
    },
    [setValue, maxItems]
  )

  return {
    recentItems: storedValue,
    addRecentItem,
    clearRecent: () => setValue([]),
    removeValue,
    loading,
    error,
  }
}
