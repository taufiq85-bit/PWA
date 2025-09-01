// src/lib/constants.ts

// Application metadata
export const APP_CONFIG = {
  name: 'Sistem Informasi Praktikum',
  shortName: 'SI Praktikum',
  description: 'Sistem Informasi Praktikum AKBID Mega Buana',
  version: '1.0.0',
  author: 'AKBID Mega Buana',
  keywords: ['praktikum', 'kebidanan', 'laboratorium', 'pwa'],
} as const

// Institution information
export const INSTITUTION = {
  name: 'Akademi Kebidanan Mega Buana',
  shortName: 'AKBID Mega Buana',
  address: 'Jl. Titang No. 31A, Sinjai',
  phone: '+62 411 123456',
  email: 'info@akbid-megabuana.ac.id',
  website: 'www.megabuanasinjai@ac.id',
} as const

// System roles
export const ROLES = {
  ADMIN: 'admin',
  DOSEN: 'dosen',
  MAHASISWA: 'mahasiswa',
  LABORAN: 'laboran',
} as const

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.DOSEN]: 'Dosen',
  [ROLES.MAHASISWA]: 'Mahasiswa',
  [ROLES.LABORAN]: 'Laboran',
} as const

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'red',
  [ROLES.DOSEN]: 'blue',
  [ROLES.MAHASISWA]: 'green',
  [ROLES.LABORAN]: 'purple',
} as const

export const ROLE_ICONS = {
  [ROLES.ADMIN]: '👑',
  [ROLES.DOSEN]: '👨‍🏫',
  [ROLES.MAHASISWA]: '🎓',
  [ROLES.LABORAN]: '🔬',
} as const

// Permission resources and actions
export const PERMISSIONS = {
  RESOURCES: {
    USERS: 'users',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
    LABORATORIES: 'laboratories',
    EQUIPMENTS: 'equipments',
    MATA_KULIAH: 'mata_kuliah',
    KUIS: 'kuis',
    MATERI: 'materi',
    JADWAL: 'jadwal',
    PEMINJAMAN: 'peminjaman',
    BOOKING: 'booking',
    INVENTARIS: 'inventaris',
    NILAI: 'nilai',
    PENGUMUMAN: 'pengumuman',
    SYSTEM: 'system',
  },
  ACTIONS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage',
    APPROVE: 'approve',
    PUBLISH: 'publish',
    EXPORT: 'export',
    IMPORT: 'import',
  },
} as const

// Laboratory specifications (9 kebidanan labs + 1 equipment depot)
export const LABORATORIES = {
  LAB_KTD: {
    id: 'lab-ktd',
    name: 'Lab Keterampilan Dasar Praktik Kebidanan',
    code: 'LK001',
    capacity: 25,
    type: 'praktikum',
  },
  LAB_ANC: {
    id: 'lab-anc',
    name: 'Lab ANC (Antenatal Careoratorium Maternitas)',
    code: 'LM002',
    capacity: 20,
    type: 'praktikum',
  },
  LAB_PNC: {
    id: 'lab-pnc',
    name: 'Lab PNC (Postnatal Care)',
    code: 'LA003',
    capacity: 20,
    type: 'praktikum',
  },
  LAB_INC: {
    id: 'lab-inc',
    name: 'Lab INC (Intranatal Care)',
    code: 'LD004',
    capacity: 30,
    type: 'praktikum',
  },
  LAB_BBL: {
    id: 'lab-bbl',
    name: 'Lab BBL (Bayi Baru Lahir)',
    code: 'LF005',
    capacity: 25,
    type: 'praktikum',
  },
  LAB_KB: {
    id: 'lab-kb',
    name: 'Lab Pelayanan KB',
    code: 'LG006',
    capacity: 20,
    type: 'praktikum',
  },
  LAB_KONSELING: {
    id: 'lab-konseling',
    name: 'Lab Konseling & Pendidikan Kesehatan',
    code: 'LR007',
    capacity: 20,
    type: 'praktikum',
  },
  LAB_KOMUNITAS: {
    id: 'lab-komunitas',
    name: 'Lab Kebidanan Komunitas',
    code: 'LK008',
    capacity: 15,
    type: 'praktikum',
  },
  LAB_ANAK: {
    id: 'lab-anak',
    name: 'Lab Bayi, Balita, Anak Prasekolah',
    code: 'LC009',
    capacity: 40,
    type: 'praktikum',
  },
  DEPO_ALAT: {
    id: 'depo-alat',
    name: 'Depo Alat dan Bahan',
    code: 'DA010',
    capacity: 5,
    type: 'storage',
  },
} as const

// Quiz configuration
export const QUIZ_CONFIG = {
  TYPES: {
    PRACTICE: 'practice',
    EXAM: 'exam',
    ASSIGNMENT: 'assignment',
  },
  QUESTION_TYPES: {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    ESSAY: 'essay',
  },
  MAX_DURATION: 180, // minutes
  MAX_ATTEMPTS: 5,
  MAX_QUESTIONS: 50,
  MIN_PASSING_SCORE: 60,
} as const

export const QUIZ_TYPE_LABELS = {
  [QUIZ_CONFIG.TYPES.PRACTICE]: 'Latihan',
  [QUIZ_CONFIG.TYPES.EXAM]: 'Ujian',
  [QUIZ_CONFIG.TYPES.ASSIGNMENT]: 'Tugas',
} as const

export const QUESTION_TYPE_LABELS = {
  [QUIZ_CONFIG.QUESTION_TYPES.MULTIPLE_CHOICE]: 'Pilihan Ganda',
  [QUIZ_CONFIG.QUESTION_TYPES.TRUE_FALSE]: 'Benar/Salah',
  [QUIZ_CONFIG.QUESTION_TYPES.ESSAY]: 'Essay',
} as const

// Status values
export const STATUS = {
  // General status
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',

  // Approval status
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',

  // Booking status
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',

  // Equipment condition
  GOOD: 'baik',
  DAMAGED: 'rusak',
  MAINTENANCE: 'maintenance',
} as const

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: {
    AVATAR: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 25 * 1024 * 1024, // 25MB
    MATERIAL: 50 * 1024 * 1024, // 50MB
    VIDEO: 100 * 1024 * 1024, // 100MB
  },
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    MATERIALS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'audio/mpeg',
    ],
    SPREADSHEETS: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
  },
} as const

// Time constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMITS: [10, 25, 50, 100],
} as const

// API configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// Validation rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  NIM: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 12,
    PATTERN: /^[0-9]{8,12}$/,
  },
  PHONE: {
    PATTERN: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
  },
} as const

// Academic constants
export const ACADEMIC = {
  SEMESTERS: [1, 2, 3, 4, 5, 6, 7, 8],
  DAYS: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  CREDIT_RANGE: { MIN: 1, MAX: 6 },
  GPA_SCALE: { MIN: 0, MAX: 4 },
  GRADES: {
    A: { min: 85, max: 100, points: 4 },
    B: { min: 70, max: 84, points: 3 },
    C: { min: 55, max: 69, points: 2 },
    D: { min: 40, max: 54, points: 1 },
    E: { min: 0, max: 39, points: 0 },
  },
} as const

// Equipment categories
export const EQUIPMENT_CATEGORIES = [
  'Alat Kebidanan',
  'Alat Medis',
  'Phantom/Manekin',
  'Alat Laboratorium',
  'Elektronik',
  'Furniture',
  'Komputer/IT',
  'Lainnya',
] as const

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

// PWA constants
export const PWA = {
  THEME_COLOR: '#2563eb',
  BACKGROUND_COLOR: '#ffffff',
  DISPLAY: 'standalone',
  ORIENTATION: 'portrait',
  SCOPE: '/',
  START_URL: '/',
  CACHE_NAME: 'si-praktikum-v1',
  OFFLINE_URL: '/offline.html',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_ROUTE: 'last_route',
  OFFLINE_QUEUE: 'offline_queue',
} as const

// API endpoints base paths
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  LABORATORIES: '/laboratories',
  EQUIPMENTS: '/equipments',
  MATA_KULIAH: '/mata-kuliah',
  KUIS: '/kuis',
  MATERI: '/materi',
  JADWAL: '/jadwal',
  PEMINJAMAN: '/peminjaman',
  BOOKING: '/booking',
  INVENTARIS: '/inventaris',
  NILAI: '/nilai',
  PENGUMUMAN: '/pengumuman',
} as const

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',

  // Business logic errors
  BUSINESS_QUOTA_EXCEEDED: 'BUSINESS_QUOTA_EXCEEDED',
  BUSINESS_CONFLICT: 'BUSINESS_CONFLICT',
  BUSINESS_INVALID_STATE: 'BUSINESS_INVALID_STATE',

  // System errors
  SYSTEM_DATABASE_ERROR: 'SYSTEM_DATABASE_ERROR',
  SYSTEM_NETWORK_ERROR: 'SYSTEM_NETWORK_ERROR',
  SYSTEM_INTERNAL_ERROR: 'SYSTEM_INTERNAL_ERROR',
} as const

// Theme configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#2563eb',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const

// Export all constants as a single object for easy access
export const CONSTANTS = {
  APP_CONFIG,
  INSTITUTION,
  ROLES,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_ICONS,
  PERMISSIONS,
  LABORATORIES,
  QUIZ_CONFIG,
  QUIZ_TYPE_LABELS,
  QUESTION_TYPE_LABELS,
  STATUS,
  FILE_UPLOAD,
  TIME,
  PAGINATION,
  API_CONFIG,
  VALIDATION,
  ACADEMIC,
  EQUIPMENT_CATEGORIES,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  PWA,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_CODES,
  THEME,
} as const
