// src/context/OfflineContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'

interface OfflineContextType {
  isOnline: boolean
  isOffline: boolean
  connectionType: string
  lastOnlineTime: Date | null
  retryConnection: () => Promise<boolean>
  showOfflineToast: boolean
  setShowOfflineToast: (show: boolean) => void
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

interface OfflineProviderProps {
  children: React.ReactNode
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null)
  const [showOfflineToast, setShowOfflineToast] = useState<boolean>(false)

  const updateConnectionStatus = useCallback(() => {
    const online = navigator.onLine
    setIsOnline(online)

    if (online) {
      setLastOnlineTime(new Date())
      setShowOfflineToast(false)
    } else {
      // Show toast after a brief delay to avoid false positives
      setTimeout(() => {
        if (!navigator.onLine) {
          setShowOfflineToast(true)
        }
      }, 1000)
    }
  }, [])

  const updateConnectionType = useCallback(() => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (connection) {
      setConnectionType(
        connection.effectiveType || connection.type || 'unknown'
      )
    } else {
      setConnectionType('unknown')
    }
  }, [])

  const retryConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to test connection
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setIsOnline(true)
        setLastOnlineTime(new Date())
        setShowOfflineToast(false)
        return true
      }
      return false
    } catch (error) {
      console.warn('Connection retry failed:', error)
      return false
    }
  }, [])

  useEffect(() => {
    // Set initial state
    updateConnectionStatus()
    updateConnectionType()

    if (navigator.onLine) {
      setLastOnlineTime(new Date())
    }

    // Event listeners for online/offline
    const handleOnline = () => {
      updateConnectionStatus()
      updateConnectionType()
    }

    const handleOffline = () => {
      updateConnectionStatus()
    }

    // Event listener for connection type changes
    const handleConnectionChange = () => {
      updateConnectionType()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    // Periodic connection check when offline
    const intervalId = setInterval(() => {
      if (!navigator.onLine) {
        retryConnection()
      }
    }, 30000) // Check every 30 seconds when offline

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }

      clearInterval(intervalId)
    }
  }, [updateConnectionStatus, updateConnectionType, retryConnection])

  const value = {
    isOnline,
    isOffline: !isOnline,
    connectionType,
    lastOnlineTime,
    retryConnection,
    showOfflineToast,
    setShowOfflineToast,
  }

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  )
}

export const useOffline = () => {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}
