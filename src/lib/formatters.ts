// src/lib/formatters.ts

// Date formatters
export const formatDate = {
  // Format as Indonesian date
  toIndonesian: (date: string | Date): string => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  },

  // Format as short date
  toShort: (date: string | Date): string => {
    return new Date(date).toLocaleDateString('id-ID')
  },

  // Format as ISO string
  toISO: (date: string | Date): string => {
    return new Date(date).toISOString()
  },

  // Format time only
  timeOnly: (date: string | Date): string => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  // Format datetime
  dateTime: (date: string | Date): string => {
    return new Date(date).toLocaleString('id-ID')
  },

  // Relative time (e.g., "2 jam yang lalu")
  relative: (date: string | Date): string => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    const intervals = [
      { label: 'tahun', seconds: 31536000 },
      { label: 'bulan', seconds: 2592000 },
      { label: 'hari', seconds: 86400 },
      { label: 'jam', seconds: 3600 },
      { label: 'menit', seconds: 60 },
    ]

    if (diffInSeconds < 60) return 'Baru saja'

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds)
      if (count > 0) {
        return `${count} ${interval.label} yang lalu`
      }
    }

    return 'Baru saja'
  },

  // Format for input datetime-local
  forInput: (date: string | Date): string => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  },

  // Format academic semester
  semester: (date: string | Date): string => {
    const d = new Date(date)
    const month = d.getMonth() + 1
    const year = d.getFullYear()

    if (month >= 2 && month <= 7) {
      return `Semester Genap ${year - 1}/${year}`
    } else {
      return `Semester Ganjil ${year}/${year + 1}`
    }
  },
}

// Number formatters
export const formatNumber = {
  // Indonesian number format
  toIndonesian: (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num)
  },

  // Currency format
  currency: (amount: number, currency = 'IDR'): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  },

  // Percentage format
  percentage: (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`
  },

  // Score format with color coding
  score: (
    score: number,
    maxScore: number = 100
  ): {
    formatted: string
    percentage: number
    grade: string
    color: string
  } => {
    const percentage = (score / maxScore) * 100
    let grade = 'F'
    let color = 'red'

    if (percentage >= 85) {
      grade = 'A'
      color = 'green'
    } else if (percentage >= 70) {
      grade = 'B'
      color = 'blue'
    } else if (percentage >= 55) {
      grade = 'C'
      color = 'yellow'
    } else if (percentage >= 40) {
      grade = 'D'
      color = 'orange'
    }

    return {
      formatted: `${score.toFixed(1)}/${maxScore}`,
      percentage: Math.round(percentage),
      grade,
      color,
    }
  },

  // Decimal places
  decimal: (num: number, places = 2): string => {
    return num.toFixed(places)
  },

  // Ordinal numbers (1st, 2nd, 3rd, etc.)
  ordinal: (num: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd']
    const value = num % 100
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
  },
}

// Text formatters
export const formatText = {
  // Capitalize first letter
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  // Title case
  titleCase: (text: string): string => {
    return text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  // Truncate with ellipsis
  truncate: (text: string, length = 50): string => {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
  },

  // Extract initials
  initials: (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  },

  // Format NIM with dots
  nim: (nim: string): string => {
    // Format: 20210001 -> 2021.0001
    if (nim.length === 8) {
      return nim.slice(0, 4) + '.' + nim.slice(4)
    }
    return nim
  },

  // Format phone number
  phone: (phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '')

    // Format Indonesian phone
    if (cleaned.startsWith('62')) {
      const number = cleaned.slice(2)
      return `+62 ${number.slice(0, 3)} ${number.slice(3, 7)} ${number.slice(7)}`
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.slice(1)
      return `${cleaned.slice(0, 4)} ${number.slice(3, 7)} ${number.slice(7)}`
    }

    return phone
  },

  // Slug format
  slug: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // Word count
  wordCount: (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  },

  // Reading time estimate
  readingTime: (text: string, wordsPerMinute = 200): string => {
    const words = formatText.wordCount(text)
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} menit baca`
  },
}

// File formatters
export const formatFile = {
  // File size
  size: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // File type icon
  typeIcon: (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase()

    const iconMap: Record<string, string> = {
      // Documents
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      txt: '📄',

      // Images
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      svg: '🖼️',

      // Videos
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      wmv: '🎥',

      // Audio
      mp3: '🎵',
      wav: '🎵',
      flac: '🎵',

      // Archives
      zip: '📦',
      rar: '📦',
      '7z': '📦',
    }

    return iconMap[extension || ''] || '📄'
  },

  // File type category
  category: (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase()

    if (
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')
    ) {
      return 'image'
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return 'video'
    } else if (['mp3', 'wav', 'flac'].includes(extension || '')) {
      return 'audio'
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'document'
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return 'spreadsheet'
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return 'presentation'
    }

    return 'file'
  },
}

// Status formatters
export const formatStatus = {
  // Quiz status
  quiz: (status: string): { label: string; color: string; icon: string } => {
    const statusMap: Record<string, any> = {
      draft: { label: 'Draft', color: 'gray', icon: '📝' },
      active: { label: 'Aktif', color: 'green', icon: '✅' },
      closed: { label: 'Ditutup', color: 'red', icon: '🔒' },
      scheduled: { label: 'Terjadwal', color: 'blue', icon: '⏰' },
    }

    return statusMap[status] || { label: status, color: 'gray', icon: '❓' }
  },

  // Booking status
  booking: (status: string): { label: string; color: string; icon: string } => {
    const statusMap: Record<string, any> = {
      pending: { label: 'Menunggu', color: 'yellow', icon: '⏳' },
      approved: { label: 'Disetujui', color: 'green', icon: '✅' },
      rejected: { label: 'Ditolak', color: 'red', icon: '❌' },
      active: { label: 'Sedang Berlangsung', color: 'blue', icon: '🔄' },
      completed: { label: 'Selesai', color: 'green', icon: '✅' },
      cancelled: { label: 'Dibatalkan', color: 'gray', icon: '🚫' },
    }

    return statusMap[status] || { label: status, color: 'gray', icon: '❓' }
  },

  // Equipment condition
  equipment: (
    condition: string
  ): { label: string; color: string; icon: string } => {
    const conditionMap: Record<string, any> = {
      baik: { label: 'Baik', color: 'green', icon: '✅' },
      rusak: { label: 'Rusak', color: 'red', icon: '🔧' },
      maintenance: { label: 'Maintenance', color: 'yellow', icon: '⚠️' },
    }

    return (
      conditionMap[condition] || { label: condition, color: 'gray', icon: '❓' }
    )
  },

  // User active status
  userActive: (
    isActive: boolean
  ): { label: string; color: string; icon: string } => {
    return isActive
      ? { label: 'Aktif', color: 'green', icon: '✅' }
      : { label: 'Nonaktif', color: 'red', icon: '❌' }
  },
}

// Role formatters
export const formatRole = {
  // Role display name
  name: (role: string): string => {
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      dosen: 'Dosen',
      mahasiswa: 'Mahasiswa',
      laboran: 'Laboran',
    }

    return roleNames[role] || role
  },

  // Role color
  color: (role: string): string => {
    const roleColors: Record<string, string> = {
      admin: 'red',
      dosen: 'blue',
      mahasiswa: 'green',
      laboran: 'purple',
    }

    return roleColors[role] || 'gray'
  },

  // Role icon
  icon: (role: string): string => {
    const roleIcons: Record<string, string> = {
      admin: '👑',
      dosen: '👨‍🏫',
      mahasiswa: '🎓',
      laboran: '🔬',
    }

    return roleIcons[role] || '👤'
  },
}

// Academic formatters
export const formatAcademic = {
  // Semester format
  semester: (semester: number): string => {
    return `Semester ${semester}`
  },

  // Grade format
  grade: (score: number): { letter: string; color: string } => {
    if (score >= 85) return { letter: 'A', color: 'green' }
    if (score >= 70) return { letter: 'B', color: 'blue' }
    if (score >= 55) return { letter: 'C', color: 'yellow' }
    if (score >= 40) return { letter: 'D', color: 'orange' }
    return { letter: 'E', color: 'red' }
  },

  // Credits format
  credits: (credits: number): string => {
    return `${credits} SKS`
  },

  // Quiz attempt format
  attempt: (
    current: number,
    max: number
  ): {
    text: string
    remaining: number
    color: string
  } => {
    const remaining = max - current
    let color = 'green'

    if (remaining <= 1) color = 'red'
    else if (remaining <= 2) color = 'yellow'

    return {
      text: `Percobaan ${current} dari ${max}`,
      remaining,
      color,
    }
  },
}

// Laboratory formatters
export const formatLaboratory = {
  // Capacity format
  capacity: (
    current: number,
    max: number
  ): {
    text: string
    percentage: number
    color: string
  } => {
    const percentage = Math.round((current / max) * 100)
    let color = 'green'

    if (percentage >= 90) color = 'red'
    else if (percentage >= 75) color = 'yellow'

    return {
      text: `${current}/${max} orang`,
      percentage,
      color,
    }
  },

  // Time slot format
  timeSlot: (start: string, end: string): string => {
    return `${start} - ${end}`
  },

  // Equipment quantity format
  equipmentQty: (
    available: number,
    total: number
  ): {
    text: string
    available: number
    percentage: number
    status: 'available' | 'limited' | 'unavailable'
  } => {
    const percentage = Math.round((available / total) * 100)
    let status: 'available' | 'limited' | 'unavailable' = 'available'

    if (available === 0) status = 'unavailable'
    else if (percentage <= 25) status = 'limited'

    return {
      text: `${available}/${total}`,
      available,
      percentage,
      status,
    }
  },
}
