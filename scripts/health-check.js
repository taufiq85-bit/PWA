import { execSync } from 'child_process'
import fs from 'fs'

console.log('í¿¥ Running development health check...')

const checks = [
  {
    name: 'TypeScript compilation',
    command: 'npx tsc --noEmit',
    critical: true
  },
  {
    name: 'ESLint',
    command: 'npm run lint',
    critical: true
  },
  {
    name: 'Prettier formatting',
    command: 'npm run format:check',
    critical: false
  },
  {
    name: 'Unit tests',
    command: 'npm run test -- --run',
    critical: true
  }
]

let failures = 0

for (const check of checks) {
  try {
    console.log(`\nâ³ Checking: ${check.name}`)
    execSync(check.command, { stdio: 'pipe' })
    console.log(`âœ… ${check.name}: PASSED`)
  } catch (error) {
    console.error(`âŒ ${check.name}: FAILED`)
    if (check.critical) failures++
  }
}

if (failures > 0) {
  console.error(`\ní²¥ ${failures} critical checks failed!`)
  process.exit(1)
} else {
  console.log('\ní¾‰ All health checks passed!')
}
