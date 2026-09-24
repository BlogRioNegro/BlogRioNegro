import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Entrar · Rio Negro Admin',
}

export default function LoginPage() {
  return (
    <main>
      <h1>Entrar no painel</h1>
      <LoginForm />
    </main>
  )
}
