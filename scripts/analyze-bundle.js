import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('Ì¥ç Analyzing bundle...')

try {
  // Build first
  execSync('npm run build', { stdio: 'inherit' })
  
  // Analyze
  execSync('npx vite-bundle-analyzer dist', { stdio: 'inherit' })
  
  console.log('‚úÖ Bundle analysis complete!')
} catch (error) {
  console.error('‚ùå Bundle analysis failed:', error)
  process.exit(1)
}
