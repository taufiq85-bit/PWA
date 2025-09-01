// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// String utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  // Convert to title case
  toTitleCase: (str: string): string => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  // Generate initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  },

  // Truncate text with ellipsis
  truncate: (str: string, length: number = 50): string => {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
  },

  // Generate slug from text
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // Remove HTML tags
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>?/gm, '')
  },

  // Generate random string
  randomString: (length: number = 8): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
}

// Array utilities
export const arrayUtils = {
  // Remove duplicates
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)]
  },

  // Group array by key
  groupBy: <T, K extends keyof T>(arr: T[], key: K): Record<string, T[]> => {
    return arr.reduce(
      (groups, item) => {
        const group = String(item[key])
        groups[group] = groups[group] || []
        groups[group].push(item)
        return groups
      },
      {} as Record<string, T[]>
    )
  },

  // Sort array by multiple keys
  sortBy: <T>(arr: T[], ...keys: (keyof T)[]): T[] => {
    return arr.sort((a, b) => {
      for (const key of keys) {
        if (a[key] < b[key]) return -1
        if (a[key] > b[key]) return 1
      }
      return 0
    })
  },

  // Chunk array into smaller arrays
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  },

  // Find item by property
  findBy: <T, K extends keyof T>(
    arr: T[],
    key: K,
    value: T[K]
  ): T | undefined => {
    return arr.find((item) => item[key] === value)
  },

  // Remove item from array
  remove: <T>(arr: T[], item: T): T[] => {
    const index = arr.indexOf(item)
    if (index > -1) {
      return [...arr.slice(0, index), ...arr.slice(index + 1)]
    }
    return arr
  },
}

// Object utilities
export const objectUtils = {
  // Pick specific keys from object
  pick: <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> => {
    const picked = {} as Pick<T, K>
    for (const key of keys) {
      if (key in obj) {
        picked[key] = obj[key]
      }
    }
    return picked
  },

  // Omit specific keys from object
  omit: <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> => {
    const omitted = { ...obj } as any
    for (const key of keys) {
      delete omitted[key]
    }
    return omitted
  },

  // Deep clone object
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
  },

  // Check if object is empty
  isEmpty: (obj: Record<string, any>): boolean => {
    return Object.keys(obj).length === 0
  },

  // Get nested property safely
  get: (obj: any, path: string, defaultValue?: any): any => {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result?.[key] === undefined) {
        return defaultValue
      }
      result = result[key]
    }
    return result
  },
}

// Date utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date: string | Date, locale = 'id-ID'): string => {
    return new Date(date).toLocaleDateString(locale)
  },

  // Format datetime for display
  formatDateTime: (date: string | Date, locale = 'id-ID'): string => {
    return new Date(date).toLocaleString(locale)
  },

  // Get relative time (e.g., "2 hours ago")
  timeAgo: (date: string | Date): string => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Baru saja'
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} menit yang lalu`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`
    return `${Math.floor(diffInSeconds / 31536000)} tahun yang lalu`
  },

  // Check if date is today
  isToday: (date: string | Date): boolean => {
    const today = new Date()
    const checkDate = new Date(date)
    return checkDate.toDateString() === today.toDateString()
  },

  // Check if date is this week
  isThisWeek: (date: string | Date): boolean => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    const checkDate = new Date(date)
    return checkDate >= weekStart && checkDate <= weekEnd
  },

  // Add days to date
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  // Get start of day
  startOfDay: (date: Date): Date => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  },

  // Get end of day
  endOfDay: (date: Date): Date => {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  },
}

// Number utilities
export const numberUtils = {
  // Format number with thousand separators
  formatNumber: (num: number, locale = 'id-ID'): string => {
    return new Intl.NumberFormat(locale).format(num)
  },

  // Format as currency
  formatCurrency: (
    amount: number,
    currency = 'IDR',
    locale = 'id-ID'
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount)
  },

  // Format as percentage
  formatPercentage: (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`
  },

  // Clamp number between min and max
  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max)
  },

  // Generate random number between min and max
  randomBetween: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // Round to decimal places
  roundTo: (num: number, decimals: number): number => {
    return Number(num.toFixed(decimals))
  },
}

// File utilities
export const fileUtils = {
  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Get file extension
  getExtension: (filename: string): string => {
    return filename
      .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
      .toLowerCase()
  },

  // Check if file is image
  isImage: (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    return imageExtensions.includes(fileUtils.getExtension(filename))
  },

  // Check if file is document
  isDocument: (filename: string): boolean => {
    const docExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
    ]
    return docExtensions.includes(fileUtils.getExtension(filename))
  },

  // Check if file is video
  isVideo: (filename: string): boolean => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
    return videoExtensions.includes(fileUtils.getExtension(filename))
  },
}

// URL utilities
export const urlUtils = {
  // Build query string from object
  buildQuery: (params: Record<string, any>): string => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return query.toString()
  },

  // Parse query string to object
  parseQuery: (queryString: string): Record<string, string> => {
    const params = new URLSearchParams(queryString)
    const result: Record<string, string> = {}
    for (const [key, value] of params) {
      result[key] = value
    }
    return result
  },

  // Check if URL is external
  isExternal: (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname !== window.location.hostname
    } catch {
      return false
    }
  },
}

// Local storage utilities with error handling
export const storageUtils = {
  // Get item from localStorage
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },

  // Set item in localStorage
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  // Remove item from localStorage
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  // Clear all localStorage
  clear: (): boolean => {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  },
}

// Async utilities
export const asyncUtils = {
  // Sleep/delay function
  sleep: (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  // Retry function with exponential backoff
  retry: async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> => {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) throw error
      await asyncUtils.sleep(delay)
      return asyncUtils.retry(fn, retries - 1, delay * 2)
    }
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        func(...args)
      }
    }
  },
}

// Validation utilities
export const validationUtils = {
  // Check if email is valid
  isEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  // Check if phone number is valid (Indonesian format)
  isPhoneNumber: (phone: string): boolean => {
    const regex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/
    return regex.test(phone.replace(/\s/g, ''))
  },

  // Check if NIM is valid format
  isNIM: (nim: string): boolean => {
    const regex = /^[0-9]{8,12}$/
    return regex.test(nim)
  },

  // Check if password meets requirements
  isStrongPassword: (
    password: string
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (password.length < 8) errors.push('Minimal 8 karakter')
    if (!/[a-z]/.test(password)) errors.push('Harus ada huruf kecil')
    if (!/[A-Z]/.test(password)) errors.push('Harus ada huruf besar')
    if (!/[0-9]/.test(password)) errors.push('Harus ada angka')
    if (!/[^a-zA-Z0-9]/.test(password)) errors.push('Harus ada karakter khusus')

    return {
      valid: errors.length === 0,
      errors,
    }
  },
}

// Device utilities
export const deviceUtils = {
  // Check if mobile device
  isMobile: (): boolean => {
    return window.innerWidth <= 768
  },

  // Check if tablet device
  isTablet: (): boolean => {
    return window.innerWidth > 768 && window.innerWidth <= 1024
  },

  // Check if desktop device
  isDesktop: (): boolean => {
    return window.innerWidth > 1024
  },

  // Get device type
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    if (deviceUtils.isMobile()) return 'mobile'
    if (deviceUtils.isTablet()) return 'tablet'
    return 'desktop'
  },

  // Check if PWA is installed
  isPWA: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches
  },

  // Check if online
  isOnline: (): boolean => {
    return navigator.onLine
  },
}

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Download file
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
