// src/main.tsx - Add AuthProvider
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import providers
import { ThemeProvider } from '@/context/ThemeContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { OfflineProvider } from '@/context/OfflineContext'
import { AuthProvider } from '@/context/AuthContext' // ✅ Add AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <NotificationProvider maxNotifications={5}>
        <OfflineProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </OfflineProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
)