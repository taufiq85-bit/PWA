// src/lib/validations.ts
import { z } from 'zod'

// Common validation patterns
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/
const nimRegex = /^[0-9]{8,12}$/
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

// Authentication validations
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(
        passwordRegex,
        'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus'
      ),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    name: z
      .string()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    nim: z.string().regex(nimRegex, 'Format NIM tidak valid').optional(),
    phone: z
      .string()
      .regex(phoneRegex, 'Format nomor HP tidak valid')
      .optional(),
    role: z
      .enum(['admin', 'dosen', 'mahasiswa', 'laboran'])
      .default('mahasiswa'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(
        passwordRegex,
        'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus'
      ),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z
      .string()
      .min(8, 'Password baru minimal 8 karakter')
      .regex(
        passwordRegex,
        'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus'
      ),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

// User profile validations
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  nim: z.string().regex(nimRegex, 'Format NIM tidak valid').optional(),
  phone: z.string().regex(phoneRegex, 'Format nomor HP tidak valid').optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, 'Ukuran file maksimal 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Format file harus JPG, PNG, atau WebP'
    )
    .optional(),
})

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  nim: z.string().regex(nimRegex, 'Format NIM tidak valid').optional(),
  phone: z.string().regex(phoneRegex, 'Format nomor HP tidak valid').optional(),
  role: z.enum(['admin', 'dosen', 'mahasiswa', 'laboran']),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      passwordRegex,
      'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus'
    )
    .optional(),
})

// Academic validations
export const mataKuliahSchema = z.object({
  code: z
    .string()
    .min(2, 'Kode mata kuliah minimal 2 karakter')
    .max(20, 'Kode mata kuliah maksimal 20 karakter'),
  name: z
    .string()
    .min(5, 'Nama mata kuliah minimal 5 karakter')
    .max(200, 'Nama mata kuliah maksimal 200 karakter'),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional(),
  credits: z.number().min(1, 'SKS minimal 1').max(6, 'SKS maksimal 6'),
  semester: z
    .number()
    .min(1, 'Semester minimal 1')
    .max(8, 'Semester maksimal 8'),
  dosen_id: z.string().uuid('Format dosen ID tidak valid'),
})

export const jadwalSchema = z
  .object({
    mata_kuliah_id: z.string().uuid('Format mata kuliah ID tidak valid'),
    laboratory_id: z.string().uuid('Format laboratorium ID tidak valid'),
    hari: z.enum([
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
      'Minggu',
    ]),
    jam_mulai: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Format waktu tidak valid (HH:MM)'
      ),
    jam_selesai: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Format waktu tidak valid (HH:MM)'
      ),
    tanggal_mulai: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
    tanggal_selesai: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
    kapasitas: z
      .number()
      .min(1, 'Kapasitas minimal 1 orang')
      .max(50, 'Kapasitas maksimal 50 orang'),
  })
  .refine(
    (data) => {
      const mulai = new Date(`2000-01-01 ${data.jam_mulai}`)
      const selesai = new Date(`2000-01-01 ${data.jam_selesai}`)
      return selesai > mulai
    },
    {
      message: 'Jam selesai harus setelah jam mulai',
      path: ['jam_selesai'],
    }
  )
  .refine(
    (data) => {
      return new Date(data.tanggal_selesai) >= new Date(data.tanggal_mulai)
    },
    {
      message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
      path: ['tanggal_selesai'],
    }
  )

// Quiz validations
export const kuisSchema = z
  .object({
    mata_kuliah_id: z.string().uuid('Format mata kuliah ID tidak valid'),
    title: z
      .string()
      .min(5, 'Judul kuis minimal 5 karakter')
      .max(200, 'Judul kuis maksimal 200 karakter'),
    description: z
      .string()
      .max(1000, 'Deskripsi maksimal 1000 karakter')
      .optional(),
    durasi_menit: z
      .number()
      .min(5, 'Durasi minimal 5 menit')
      .max(180, 'Durasi maksimal 180 menit'),
    total_soal: z.number().min(1, 'Minimal 1 soal').max(50, 'Maksimal 50 soal'),
    passing_score: z
      .number()
      .min(0, 'Nilai minimal 0')
      .max(100, 'Nilai maksimal 100'),
    max_attempts: z
      .number()
      .min(1, 'Minimal 1 percobaan')
      .max(5, 'Maksimal 5 percobaan'),
    tipe_kuis: z.enum(['practice', 'exam', 'assignment']),
    mulai_pada: z
      .string()
      .refine(
        (date) => !isNaN(Date.parse(date)),
        'Format tanggal mulai tidak valid'
      ),
    selesai_pada: z
      .string()
      .refine(
        (date) => !isNaN(Date.parse(date)),
        'Format tanggal selesai tidak valid'
      ),
    shuffle_questions: z.boolean().default(false),
    show_results: z.boolean().default(true),
  })
  .refine(
    (data) => {
      return new Date(data.selesai_pada) > new Date(data.mulai_pada)
    },
    {
      message: 'Tanggal selesai harus setelah tanggal mulai',
      path: ['selesai_pada'],
    }
  )

export const kuisQuestionSchema = z
  .object({
    kuis_id: z.string().uuid('Format kuis ID tidak valid'),
    question: z
      .string()
      .min(10, 'Pertanyaan minimal 10 karakter')
      .max(1000, 'Pertanyaan maksimal 1000 karakter'),
    question_type: z.enum(['multiple_choice', 'true_false', 'essay']),
    options: z
      .array(z.string())
      .min(2, 'Minimal 2 pilihan jawaban')
      .max(6, 'Maksimal 6 pilihan jawaban')
      .optional(),
    correct_answer: z.string().min(1, 'Jawaban benar wajib diisi'),
    points: z.number().min(1, 'Poin minimal 1').max(10, 'Poin maksimal 10'),
    explanation: z
      .string()
      .max(500, 'Penjelasan maksimal 500 karakter')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.question_type === 'multiple_choice') {
        return data.options && data.options.length >= 2
      }
      return true
    },
    {
      message: 'Pilihan ganda harus memiliki minimal 2 opsi',
      path: ['options'],
    }
  )

// Laboratory and equipment validations
export const laboratorySchema = z.object({
  name: z
    .string()
    .min(3, 'Nama laboratorium minimal 3 karakter')
    .max(100, 'Nama laboratorium maksimal 100 karakter'),
  code: z
    .string()
    .min(2, 'Kode laboratorium minimal 2 karakter')
    .max(20, 'Kode laboratorium maksimal 20 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  capacity: z
    .number()
    .min(5, 'Kapasitas minimal 5 orang')
    .max(100, 'Kapasitas maksimal 100 orang'),
  location: z
    .string()
    .min(3, 'Lokasi minimal 3 karakter')
    .max(200, 'Lokasi maksimal 200 karakter'),
  facilities: z.array(z.string()).optional(),
})

export const equipmentSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama alat minimal 3 karakter')
    .max(200, 'Nama alat maksimal 200 karakter'),
  code: z
    .string()
    .min(2, 'Kode alat minimal 2 karakter')
    .max(50, 'Kode alat maksimal 50 karakter'),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional(),
  category: z
    .string()
    .min(2, 'Kategori minimal 2 karakter')
    .max(100, 'Kategori maksimal 100 karakter'),
  brand: z.string().max(100, 'Merek maksimal 100 karakter').optional(),
  model: z.string().max(100, 'Model maksimal 100 karakter').optional(),
  quantity_total: z.number().min(1, 'Jumlah minimal 1'),
  condition: z.enum(['baik', 'rusak', 'maintenance']),
  location: z
    .string()
    .min(3, 'Lokasi minimal 3 karakter')
    .max(200, 'Lokasi maksimal 200 karakter'),
  purchase_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid')
    .optional(),
  purchase_price: z.number().min(0, 'Harga tidak boleh negatif').optional(),
})

// Booking validations
export const peminjamanSchema = z
  .object({
    mata_kuliah_id: z.string().uuid('Format mata kuliah ID tidak valid'),
    equipment_id: z.string().uuid('Format equipment ID tidak valid'),
    quantity_requested: z.number().min(1, 'Jumlah minimal 1'),
    tanggal_pinjam: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
    tanggal_kembali: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
    keperluan: z
      .string()
      .min(10, 'Keperluan minimal 10 karakter')
      .max(500, 'Keperluan maksimal 500 karakter'),
  })
  .refine(
    (data) => {
      return new Date(data.tanggal_kembali) > new Date(data.tanggal_pinjam)
    },
    {
      message: 'Tanggal kembali harus setelah tanggal pinjam',
      path: ['tanggal_kembali'],
    }
  )

export const bookingSchema = z
  .object({
    laboratory_id: z.string().uuid('Format laboratorium ID tidak valid'),
    mata_kuliah_id: z.string().uuid('Format mata kuliah ID tidak valid'),
    tanggal_booking: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
    jam_mulai: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Format waktu tidak valid (HH:MM)'
      ),
    jam_selesai: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Format waktu tidak valid (HH:MM)'
      ),
    jumlah_peserta: z.number().min(1, 'Jumlah peserta minimal 1'),
    keperluan: z
      .string()
      .min(10, 'Keperluan minimal 10 karakter')
      .max(500, 'Keperluan maksimal 500 karakter'),
  })
  .refine(
    (data) => {
      const mulai = new Date(`2000-01-01 ${data.jam_mulai}`)
      const selesai = new Date(`2000-01-01 ${data.jam_selesai}`)
      return selesai > mulai
    },
    {
      message: 'Jam selesai harus setelah jam mulai',
      path: ['jam_selesai'],
    }
  )

// File upload validations
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'File tidak boleh kosong')
    .refine((file) => file.size <= 50000000, 'Ukuran file maksimal 50MB'),
  category: z.enum(['material', 'document', 'image']).default('document'),
})

export const materiSchema = z.object({
  mata_kuliah_id: z.string().uuid('Format mata kuliah ID tidak valid'),
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional(),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50000000, 'Ukuran file maksimal 50MB')
    .refine((file) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'audio/mpeg',
      ]
      return allowedTypes.includes(file.type)
    }, 'Format file tidak didukung'),
})

// Announcement validation
export const pengumumanSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  content: z
    .string()
    .min(10, 'Konten minimal 10 karakter')
    .max(5000, 'Konten maksimal 5000 karakter'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  target_roles: z
    .array(z.enum(['admin', 'dosen', 'mahasiswa', 'laboran']))
    .min(1, 'Minimal pilih 1 role target'),
  valid_until: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid')
    .optional(),
})

// Search validation
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Kata kunci minimal 1 karakter')
    .max(100, 'Kata kunci maksimal 100 karakter'),
  category: z.string().optional(),
  sort_by: z.enum(['relevance', 'date', 'name']).default('relevance'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Export type inference
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type MataKuliahFormData = z.infer<typeof mataKuliahSchema>
export type KuisFormData = z.infer<typeof kuisSchema>
export type PeminjamanFormData = z.infer<typeof peminjamanSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
