// src/lib/pwa.ts - Minimal version
export const pwaUtils = {
  isInstalled: () => {
    return window.matchMedia('(display-mode: standalone)').matches
  },

  canInstall: () => {
    return 'serviceWorker' in navigator
  },
}
