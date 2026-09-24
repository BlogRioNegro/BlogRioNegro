import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { z } from 'zod'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const CLI = path.join(ROOT, 'node_modules/supabase/dist/supabase.js')
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost'])

const statusSchema = z.object({
  API_URL: z.url(),
  ANON_KEY: z.string().min(1),
  SERVICE_ROLE_KEY: z.string().min(1),
})

function runCli(args: string[]): string {
  return execFileSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: 'utf8' })
}

function parseJsonOutput(output: string): unknown {
  return JSON.parse(output.slice(output.indexOf('{')))
}

function readStatus() {
  const status = statusSchema.parse(parseJsonOutput(runCli(['status', '-o', 'json'])))
  if (!LOCAL_HOSTS.has(new URL(status.API_URL).hostname)) {
    throw new Error('Os testes de integração só rodam contra o Supabase local')
  }
  return status
}

export const localSupabase = readStatus()
