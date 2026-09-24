import { defineConfig, devices } from '@playwright/test'
import { localSupabase } from '../integration/support/local-supabase'

const ADMIN_PORT = 3101
const ADMIN_URL = `http://localhost:${ADMIN_PORT}`

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  reporter: 'list',
  use: {
    baseURL: ADMIN_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm --filter @rio-negro/admin exec next dev --port ${ADMIN_PORT}`,
    url: `${ADMIN_URL}/login`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: localSupabase.API_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: localSupabase.ANON_KEY,
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      ADMIN_SITE_URL: ADMIN_URL,
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
})
