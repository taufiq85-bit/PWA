// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: Date
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const generateId = () =>
    Math.random().toString(36).substring(2) + Date.now().toString(36)

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>) => {
      const newNotification: Notification = {
        ...notification,
        id: generateId(),
        timestamp: new Date(),
        duration: notification.duration ?? 5000, // Default 5 seconds
      }

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, maxNotifications)
        return updated
      })

      // Auto remove notification
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(newNotification.id)
        }, newNotification.duration)
      }
    },
    [maxNotifications]
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: 'success', title, message })
    },
    [addNotification]
  )

  const showError = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: 'error', title, message, duration: 7000 })
    },
    [addNotification]
  )

  const showWarning = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: 'warning', title, message, duration: 6000 })
    },
    [addNotification]
  )

  const showInfo = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: 'info', title, message })
    },
    [addNotification]
  )

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    )
  }
  return context
}
