import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  ADMIN_SITE_URL: 'http://localhost:3001',
}

async function loadEnv() {
  const { env } = await import('./env')
  return env
}

describe('env do apps/admin', () => {
  beforeEach(() => {
    vi.resetModules()
    for (const [name, value] of Object.entries(validEnv)) vi.stubEnv(name, value)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('carrega quando todas as obrigatórias estão presentes', async () => {
    const env = await loadEnv()

    expect(env.ADMIN_SITE_URL).toBe('http://localhost:3001')
  })

  it('falha nomeando a variável obrigatória ausente', async () => {
    vi.stubEnv('ADMIN_SITE_URL', undefined)

    await expect(loadEnv()).rejects.toThrow('ADMIN_SITE_URL')
  })

  it('nunca expõe a service role, mesmo se ela existir no ambiente', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key')

    const env = await loadEnv()

    expect(env).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY')
  })
})
