import { defineConfig, devices } from '@playwright/test'
import { localSupabase } from '../integration/support/local-supabase'
import { WEB_URL } from './support/urls'

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
  webServer: [
    {
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
    {
      command: `pnpm --filter @rio-negro/web exec next dev --port ${new URL(WEB_URL).port}`,
      url: WEB_URL,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: localSupabase.API_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: localSupabase.ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: localSupabase.SERVICE_ROLE_KEY,
        NEXT_PUBLIC_SITE_URL: WEB_URL,
        NEXT_PUBLIC_RIO_NEGRO_URL: 'https://rionegroinvestimentos.com.br',
        // Chaves de teste públicas do Turnstile (sempre aprovam).
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
        TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
        LEAD_HASH_SECRET: 'e2e-local-lead-hash-secret-com-32-caracteres',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
  ],
})
