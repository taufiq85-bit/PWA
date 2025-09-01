// src/lib/test-helpers.ts
import { supabase } from './supabase'
import { StorageService } from './storage'

export class TestHelpers {
  // Database connection test
  static async testDatabaseConnection(): Promise<{
    connected: boolean
    latency: number
    error?: string
  }> {
    const startTime = Date.now()

    try {
      const { error } = await supabase
        .from('users_profile')
        .select('count')
        .limit(1)

      const latency = Date.now() - startTime

      // 404 error is expected if table doesn't exist, but connection works
      if (error && error.code === 'PGRST116') {
        return {
          connected: false,
          latency,
          error: 'Table does not exist (expected before schema creation)',
        }
      }

      return {
        connected: true,
        latency,
      }
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Storage bucket test
  static async testStorageBucket(bucketName: string): Promise<{
    accessible: boolean
    fileCount: number
    error?: string
  }> {
    try {
      const { data, error: listError } =
        await StorageService.listFiles(bucketName)

      if (listError) {
        return {
          accessible: false,
          fileCount: 0,
          error: (listError as any).message ?? 'Unknown error',
        }
      }

      return {
        accessible: true,
        fileCount: data?.length || 0,
      }
    } catch (error) {
      return {
        accessible: false,
        fileCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // File upload test
  static async testFileUpload(
    bucketName: string,
    testFile: File
  ): Promise<{
    success: boolean
    uploadTime: number
    fileUrl?: string
    error?: string
  }> {
    const startTime = Date.now()
    const fileName = `test-uploads/${Date.now()}-${testFile.name}`

    try {
      const result = await StorageService.uploadFile(
        bucketName,
        fileName,
        testFile
      )

      if (result.error) {
        return {
          success: false,
          uploadTime: Date.now() - startTime,
          error: (result.error as any).message || 'Upload failed',
        }
      }

      return {
        success: true,
        uploadTime: Date.now() - startTime,
        fileUrl: result.data?.publicUrl || result.data?.fullPath,
      }
    } catch (error) {
      return {
        success: false,
        uploadTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  // Cleanup test files
  static async cleanupTestFiles(): Promise<void> {
    const buckets = ['profiles', 'materi', 'documents']

    for (const bucket of buckets) {
      try {
        const { data } = await StorageService.listFiles(bucket, 'test-uploads')

        if (data && data.length > 0) {
          const filesToDelete = data.map((file) => `test-uploads/${file.name}`)

          for (const filePath of filesToDelete) {
            await StorageService.deleteFile(bucket, filePath)
          }
        }
      } catch (error) {
        console.warn(`Failed to cleanup test files in ${bucket}:`, error)
      }
    }
  }

  // Performance test
  static async performanceTest(
    testFn: () => Promise<any>,
    iterations = 10
  ): Promise<{
    averageTime: number
    minTime: number
    maxTime: number
    successRate: number
  }> {
    const times: number[] = []
    let successes = 0

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()

      try {
        await testFn()
        successes++
      } catch (error) {
        console.warn(`Performance test iteration ${i + 1} failed:`, error)
      }

      times.push(Date.now() - startTime)
    }

    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: successes / iterations,
    }
  }

  // Environment validation
  static validateEnvironment(): {
    valid: boolean
    issues: string[]
    warnings: string[]
  } {
    const issues: string[] = []
    const warnings: string[] = []

    // Check required environment variables
    if (!import.meta.env.VITE_SUPABASE_URL) {
      issues.push('VITE_SUPABASE_URL not set')
    }

    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      issues.push('VITE_SUPABASE_ANON_KEY not set')
    }

    // Check optional environment variables
    if (!import.meta.env.VITE_APP_NAME) {
      warnings.push('VITE_APP_NAME not set (using default)')
    }

    if (!import.meta.env.VITE_APP_VERSION) {
      warnings.push('VITE_APP_VERSION not set (using default)')
    }

    // Check browser capabilities
    if (typeof window !== 'undefined') {
      if (!window.localStorage) {
        warnings.push('localStorage not available')
      }

      if (!window.sessionStorage) {
        warnings.push('sessionStorage not available')
      }

      if (!navigator.onLine) {
        warnings.push('Browser is offline')
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
    }
  }

  // Generate test data
  static generateTestData() {
    return {
      user: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        nim: `TEST${Date.now().toString().slice(-6)}`,
        phone: '08123456789',
      },
      course: {
        code: `TEST${Date.now().toString().slice(-4)}`,
        name: 'Test Course',
        description: 'Test course description',
        credits: 2,
        semester: 1,
      },
      quiz: {
        title: 'Test Quiz',
        description: 'Test quiz description',
        durasi_menit: 30,
        total_soal: 10,
        passing_score: 70,
      },
    }
  }

  // Create test file
  static createTestFile(name = 'test-image.jpg', size = 1024): File {
    const content = 'a'.repeat(size)
    return new File([content], name, { type: 'image/jpeg' })
  }
}
