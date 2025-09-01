// src/lib/storage.ts
import { supabase } from './supabase'

export class StorageService {
  // Upload file dengan path structure
  static async uploadFile(
    bucketName: string,
    filePath: string,
    file: File,
    options?: {
      cacheControl?: string
      contentType?: string
      upsert?: boolean
    }
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: options?.cacheControl || '3600',
          contentType: options?.contentType || file.type,
          upsert: options?.upsert || false,
        })

      if (error) {
        console.error(`Upload error to ${bucketName}/${filePath}:`, error)
        return { data: null, error }
      }

      // Get public URL for public buckets
      const publicUrl =
        bucketName === 'profiles'
          ? supabase.storage.from(bucketName).getPublicUrl(filePath).data
              .publicUrl
          : null

      return {
        data: {
          ...data,
          publicUrl,
          fullPath: `${bucketName}/${filePath}`,
        },
        error: null,
      }
    } catch (error) {
      console.error('Storage upload error:', error)
      return { data: null, error }
    }
  }

  // Download file (untuk private buckets)
  static async downloadFile(bucketName: string, filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath)

      return { data, error }
    } catch (error) {
      console.error('Storage download error:', error)
      return { data: null, error }
    }
  }

  // Get signed URL untuk private files
  static async getSignedUrl(
    bucketName: string,
    filePath: string,
    expiresIn: number = 3600
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn)

      return { data, error }
    } catch (error) {
      console.error('Signed URL error:', error)
      return { data: null, error }
    }
  }

  // List files in folder
  static async listFiles(bucketName: string, folderPath: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      return { data, error }
    } catch (error) {
      console.error('List files error:', error)
      return { data: null, error }
    }
  }

  // Delete file
  static async deleteFile(bucketName: string, filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      return { data, error }
    } catch (error) {
      console.error('Delete file error:', error)
      return { data: null, error }
    }
  }
}

// Specialized functions untuk setiap bucket
export class MateriStorage {
  static async uploadMaterial(
    mataKuliahId: string,
    file: File,
    fileName?: string
  ) {
    const filePath = `${mataKuliahId}/${fileName || file.name}`
    return StorageService.uploadFile('materi', filePath, file)
  }

  static async getMaterialUrl(mataKuliahId: string, fileName: string) {
    const filePath = `${mataKuliahId}/${fileName}`
    return StorageService.getSignedUrl('materi', filePath, 7200) // 2 hours
  }

  static async listCourseMaterials(mataKuliahId: string) {
    return StorageService.listFiles('materi', mataKuliahId)
  }
}

export class ProfileStorage {
  static async uploadAvatar(userId: string, file: File) {
    const filePath = `${userId}/avatar.${file.type.split('/')[1]}`
    return StorageService.uploadFile('profiles', filePath, file, {
      upsert: true,
    })
  }

  static getAvatarUrl(userId: string, fileExtension: string = 'jpg') {
    return supabase.storage
      .from('profiles')
      .getPublicUrl(`${userId}/avatar.${fileExtension}`).data.publicUrl
  }
}

export class DocumentStorage {
  static async uploadDocument(
    userId: string,
    file: File,
    category: string = 'general'
  ) {
    const filePath = `${userId}/${category}/${file.name}`
    return StorageService.uploadFile('documents', filePath, file)
  }

  static async getUserDocuments(userId: string, category?: string) {
    const folderPath = category ? `${userId}/${category}` : userId
    return StorageService.listFiles('documents', folderPath)
  }
}
