// src/hooks/useAsync.ts
import { useState, useEffect, useCallback, useRef } from 'react'

// Type definitions
interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: () => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
  setError: (error: string | null) => void
}

interface UseAsyncOptions<T> {
  immediate?: boolean // Execute immediately on mount
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  retryCount?: number
  retryDelay?: number
}

/**
 * Hook for handling async operations with loading, error, and success states
 * @param asyncFunction - Async function to execute
 * @param deps - Dependencies array (similar to useEffect)
 * @param options - Additional options
 * @returns Object with data, loading, error states and control functions
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const {
    immediate = true,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options

  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      retryCountRef.current = 0

      const result = await asyncFunction()

      if (mountedRef.current) {
        setData(result)
        onSuccess?.(result)
      }

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'

      if (retryCountRef.current < retryCount) {
        retryCountRef.current++
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        return execute()
      }

      if (mountedRef.current) {
        setError(errorMessage)
        setData(null)
        onError?.(errorMessage)
      }

      return null
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [asyncFunction, onSuccess, onError, retryCount, retryDelay])

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
    retryCountRef.current = 0
  }, [])

  const setDataManually = useCallback((newData: T | null) => {
    setData(newData)
  }, [])

  const setErrorManually = useCallback((newError: string | null) => {
    setError(newError)
  }, [])

  // Fixed: Added execute and immediate to dependency array
  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate, deps.join(',')])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData: setDataManually,
    setError: setErrorManually,
  }
}

/**
 * Hook for handling async operations that require parameters
 * @param asyncFunction - Async function that takes parameters
 * @param options - Additional options
 * @returns Object with async state and execute function
 */
export function useAsyncCallback<T, P extends unknown[]>(
  asyncFunction: (...params: P) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const { onSuccess, onError, retryCount = 0, retryDelay = 1000 } = options
  const mountedRef = useRef(true)

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      let currentRetry = 0

      const attemptExecution = async (): Promise<T | null> => {
        try {
          setLoading(true)
          setError(null)

          const result = await asyncFunction(...params)

          if (mountedRef.current) {
            setData(result)
            onSuccess?.(result)
          }

          return result
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'An unknown error occurred'

          if (currentRetry < retryCount) {
            currentRetry++
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
            return attemptExecution()
          }

          if (mountedRef.current) {
            setError(errorMessage)
            setData(null)
            onError?.(errorMessage)
          }

          return null
        } finally {
          if (mountedRef.current) {
            setLoading(false)
          }
        }
      }

      return attemptExecution()
    },
    [asyncFunction, onSuccess, onError, retryCount, retryDelay]
  )

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * Hook for polling data at regular intervals
 * @param asyncFunction - Function to poll
 * @param interval - Polling interval in milliseconds
 * @param options - Additional options
 * @returns Object with polling state and controls
 */
export function useAsyncPolling<T>(
  asyncFunction: () => Promise<T>,
  interval: number,
  options: UseAsyncOptions<T> & {
    enabled?: boolean
    stopOnError?: boolean
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState<boolean>(false)

  const {
    immediate = true,
    enabled = true,
    stopOnError = true,
    onSuccess,
    onError,
  } = options

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  const executeOnce = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const result = await asyncFunction()

      if (mountedRef.current) {
        setData(result)
        onSuccess?.(result)
      }

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'

      if (mountedRef.current) {
        setError(errorMessage)
        onError?.(errorMessage)

        if (stopOnError) {
          stopPolling()
        }
      }

      return null
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [asyncFunction, onSuccess, onError, stopOnError, stopPolling])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return

    setIsPolling(true)

    // Execute immediately
    executeOnce()

    // Set up interval
    intervalRef.current = setInterval(() => {
      executeOnce()
    }, interval)
  }, [executeOnce, interval])

  const reset = useCallback(() => {
    stopPolling()
    setData(null)
    setError(null)
    setLoading(false)
  }, [stopPolling])

  // Auto start/stop based on enabled prop
  useEffect(() => {
    if (enabled && immediate) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => stopPolling()
  }, [enabled, immediate, startPolling, stopPolling])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopPolling()
    }
  }, [stopPolling])

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    reset,
    execute: executeOnce,
  }
}

/**
 * Hook for handling multiple async operations
 * @param asyncFunctions - Array of async functions
 * @param options - Options for execution
 * @returns Object with combined state
 */
export function useAsyncBatch<T>(
  asyncFunctions: Array<() => Promise<T>>,
  options: {
    immediate?: boolean
    parallel?: boolean // Execute in parallel or sequence
    stopOnError?: boolean
  } = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState<number>(0)

  const { immediate = true, parallel = true, stopOnError = true } = options
  const mountedRef = useRef(true)

  const execute = useCallback(async (): Promise<T[] | null> => {
    try {
      setLoading(true)
      setError(null)
      setCompleted(0)
      setData([])

      let results: T[]

      if (parallel) {
        // Execute all functions in parallel
        results = await Promise.all(
          asyncFunctions.map(async (fn) => {
            const result = await fn()
            if (mountedRef.current) {
              setCompleted((prev) => prev + 1)
            }
            return result
          })
        )
      } else {
        // Execute functions in sequence
        results = []
        for (let i = 0; i < asyncFunctions.length; i++) {
          try {
            const result = await asyncFunctions[i]()
            results.push(result)
            if (mountedRef.current) {
              setCompleted(i + 1)
            }
          } catch (err) {
            if (stopOnError) {
              throw err
            } else {
              // Continue with null value for failed operations
              results.push(null as T)
            }
          }
        }
      }

      if (mountedRef.current) {
        setData(results)
      }

      return results
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Batch execution failed'

      if (mountedRef.current) {
        setError(errorMessage)
        setData([])
      }

      return null
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [asyncFunctions, parallel, stopOnError])

  const reset = useCallback(() => {
    setData([])
    setLoading(false)
    setError(null)
    setCompleted(0)
  }, [])

  // Fixed: Added asyncFunctions.length to dependency array
  useEffect(() => {
    if (immediate && asyncFunctions.length > 0) {
      execute()
    }
  }, [immediate, execute, asyncFunctions.length])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const progress =
    asyncFunctions.length > 0 ? (completed / asyncFunctions.length) * 100 : 0

  return {
    data,
    loading,
    error,
    completed,
    total: asyncFunctions.length,
    progress,
    execute,
    reset,
  }
}
