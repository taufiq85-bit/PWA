import { execSync } from 'child_process'
import fs from 'fs'

console.log('� Running development health check...')

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
    console.log(`\n⏳ Checking: ${check.name}`)
    execSync(check.command, { stdio: 'pipe' })
    console.log(`✅ ${check.name}: PASSED`)
  } catch (error) {
    console.error(`❌ ${check.name}: FAILED`)
    if (check.critical) failures++
  }
}

if (failures > 0) {
  console.error(`\n� ${failures} critical checks failed!`)
  process.exit(1)
} else {
  console.log('\n� All health checks passed!')
}
