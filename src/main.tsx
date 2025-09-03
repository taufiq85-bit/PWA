// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Context Providers
import { ThemeProvider } from '@/context/ThemeContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { OfflineProvider } from '@/context/OfflineContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <NotificationProvider maxNotifications={5}>
        <OfflineProvider>
          <App />
        </OfflineProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>
)
