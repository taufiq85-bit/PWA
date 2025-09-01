// src/hooks/useSessionStorage.ts
import { useState, useEffect, useCallback } from 'react'

// Type definitions
type SetValue<T> = T | ((val: T) => T)

interface UseSessionStorageReturn<T> {
  storedValue: T
  setValue: (value: SetValue<T>) => void
  removeValue: () => void
  loading: boolean
  error: string | null
}

/**
 * Custom hook for managing sessionStorage with React state synchronization
 * @param key - sessionStorage key
 * @param initialValue - default value if key doesn't exist
 * @returns object with storedValue, setValue, removeValue, loading, error
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): UseSessionStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Get value from sessionStorage on mount
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      if (typeof window === 'undefined') {
        setStoredValue(initialValue)
        setLoading(false)
        return
      }

      const item = window.sessionStorage.getItem(key)
      if (item === null) {
        setStoredValue(initialValue)
      } else {
        const parsed = JSON.parse(item)
        setStoredValue(parsed)
      }
    } catch (err) {
      console.error(`Error reading sessionStorage key "${key}":`, err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStoredValue(initialValue)
    } finally {
      setLoading(false)
    }
  }, [key, initialValue])

  // Set value to sessionStorage and state
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setError(null)

        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        setStoredValue(valueToStore)

        // Save to sessionStorage
        if (typeof window !== 'undefined') {
          if (valueToStore === undefined) {
            window.sessionStorage.removeItem(key)
          } else {
            window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
          }
        }

        // Dispatch custom event for same-tab synchronization
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('sessionStorageChange', {
            detail: { key, newValue: valueToStore },
          })
          window.dispatchEvent(event)
        }
      } catch (err) {
        console.error(`Error setting sessionStorage key "${key}":`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    },
    [key, storedValue]
  )

  // Remove value from sessionStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      setError(null)
      setStoredValue(initialValue)

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key)
      }

      // Dispatch custom event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('sessionStorageChange', {
          detail: { key, newValue: undefined },
        })
        window.dispatchEvent(event)
      }
    } catch (err) {
      console.error(`Error removing sessionStorage key "${key}":`, err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [key, initialValue])

  // Listen for changes within the same tab
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.newValue ?? initialValue)
      }
    }

    window.addEventListener(
      'sessionStorageChange',
      handleStorageChange as EventListener
    )

    return () => {
      window.removeEventListener(
        'sessionStorageChange',
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

// Utility hook for form data session storage
export function useSessionStorageForm<T extends Record<string, unknown>>(
  formKey: string,
  initialData: T
) {
  const { storedValue, setValue, removeValue, loading, error } =
    useSessionStorage(formKey, initialData)

  const updateField = useCallback(
    (field: keyof T, value: unknown) => {
      setValue((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [setValue]
  )

  const updateFields = useCallback(
    (fields: Partial<T>) => {
      setValue((prev) => ({
        ...prev,
        ...fields,
      }))
    },
    [setValue]
  )

  const resetForm = useCallback(() => {
    setValue(initialData)
  }, [setValue, initialData])

  const isFormDirty = storedValue !== initialData

  return {
    formData: storedValue,
    setFormData: setValue,
    updateField,
    updateFields,
    resetForm,
    clearForm: removeValue,
    isFormDirty,
    loading,
    error,
  }
}

// Hook for managing current session state
export function useSessionState() {
  const defaultSessionState = {
    currentRoute: '/',
    breadcrumbs: [] as Array<{ label: string; href: string }>,
    searchHistory: [] as string[],
    temporaryData: {} as Record<string, unknown>,
  }

  const { storedValue, setValue, removeValue } = useSessionStorage(
    'session_state',
    defaultSessionState
  )

  const updateCurrentRoute = useCallback(
    (route: string) => {
      setValue((prev) => ({
        ...prev,
        currentRoute: route,
      }))
    },
    [setValue]
  )

  const updateBreadcrumbs = useCallback(
    (breadcrumbs: Array<{ label: string; href: string }>) => {
      setValue((prev) => ({
        ...prev,
        breadcrumbs,
      }))
    },
    [setValue]
  )

  const addToSearchHistory = useCallback(
    (searchTerm: string) => {
      setValue((prev) => ({
        ...prev,
        searchHistory: [
          searchTerm,
          ...prev.searchHistory.filter((term) => term !== searchTerm),
        ].slice(0, 10),
      }))
    },
    [setValue]
  )

  const setTemporaryData = useCallback(
    (key: string, data: unknown) => {
      setValue((prev) => ({
        ...prev,
        temporaryData: {
          ...prev.temporaryData,
          [key]: data,
        },
      }))
    },
    [setValue]
  )

  const clearTemporaryData = useCallback(
    (key?: string) => {
      if (key) {
        setValue((prev) => {
          const remaining = { ...prev.temporaryData }
          delete remaining[key]
          return {
            ...prev,
            temporaryData: remaining,
          }
        })
      } else {
        setValue((prev) => ({
          ...prev,
          temporaryData: {},
        }))
      }
    },
    [setValue]
  )

  return {
    sessionState: storedValue,
    updateCurrentRoute,
    updateBreadcrumbs,
    addToSearchHistory,
    setTemporaryData,
    getTemporaryData: (key: string) => storedValue.temporaryData[key],
    clearTemporaryData,
    clearSession: removeValue,
  }
}

// Hook for managing wizard/multi-step form data
export function useSessionStorageWizard<T extends Record<string, unknown>>(
  wizardKey: string,
  steps: string[],
  initialData: T
) {
  const { storedValue, setValue, removeValue } = useSessionStorage(
    `wizard_${wizardKey}`,
    {
      currentStep: 0,
      data: initialData,
      completedSteps: [] as number[],
    }
  )

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setValue((prev) => ({
          ...prev,
          currentStep: stepIndex,
        }))
      }
    },
    [setValue, steps.length]
  )

  const nextStep = useCallback(() => {
    setValue((prev) => {
      const nextIndex = Math.min(prev.currentStep + 1, steps.length - 1)
      const completedSteps = [
        ...new Set([...prev.completedSteps, prev.currentStep]),
      ]
      return {
        ...prev,
        currentStep: nextIndex,
        completedSteps,
      }
    })
  }, [setValue, steps.length])

  const prevStep = useCallback(() => {
    setValue((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }))
  }, [setValue])

  const updateStepData = useCallback(
    (stepData: Partial<T>) => {
      setValue((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          ...stepData,
        },
      }))
    },
    [setValue]
  )

  const markStepCompleted = useCallback(
    (stepIndex: number) => {
      setValue((prev) => ({
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, stepIndex])],
      }))
    },
    [setValue]
  )

  const resetWizard = useCallback(() => {
    setValue({
      currentStep: 0,
      data: initialData,
      completedSteps: [],
    })
  }, [setValue, initialData])

  return {
    currentStep: storedValue.currentStep,
    currentStepName: steps[storedValue.currentStep],
    data: storedValue.data,
    completedSteps: storedValue.completedSteps,
    isFirstStep: storedValue.currentStep === 0,
    isLastStep: storedValue.currentStep === steps.length - 1,
    isStepCompleted: (stepIndex: number) =>
      storedValue.completedSteps.includes(stepIndex),
    goToStep,
    nextStep,
    prevStep,
    updateStepData,
    markStepCompleted,
    resetWizard,
    clearWizard: removeValue,
  }
}
