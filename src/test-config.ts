export const TEST_CONFIG = {
  // Test timeouts
  TIMEOUT: {
    CONNECTION: 5000,
    UPLOAD: 30000,
    DOWNLOAD: 10000,
    QUERY: 3000,
  },

  // Test data
  SAMPLE_FILES: {
    SMALL_IMAGE: { name: 'test-small.jpg', size: 1024 },
    MEDIUM_DOCUMENT: { name: 'test-doc.pdf', size: 1024 * 50 },
    LARGE_VIDEO: { name: 'test-video.mp4', size: 1024 * 1024 * 5 },
  },

  // Expected results
  EXPECTATIONS: {
    CONNECTION_TIME: 2000, // ms
    UPLOAD_TIME_PER_MB: 5000, // ms per MB
    DATABASE_QUERY_TIME: 500, // ms
  },

  // Test buckets
  BUCKETS: ['profiles', 'materi', 'documents'] as const,

  // Required environment variables
  REQUIRED_ENV_VARS: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const,
}
