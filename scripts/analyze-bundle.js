import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('� Analyzing bundle...')

try {
  // Build first
  execSync('npm run build', { stdio: 'inherit' })
  
  // Analyze
  execSync('npx vite-bundle-analyzer dist', { stdio: 'inherit' })
  
  console.log('✅ Bundle analysis complete!')
} catch (error) {
  console.error('❌ Bundle analysis failed:', error)
  process.exit(1)
}
