// tests/e2e/basic.spec.ts
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/PWA|Praktikum|System/)
})

test('should have service worker', async ({ page }) => {
  await page.goto('/')
  
  // Wait for service worker to register
  const swRegistered = await page.evaluate(() => {
    return 'serviceWorker' in navigator
  })
  
  expect(swRegistered).toBe(true)
})