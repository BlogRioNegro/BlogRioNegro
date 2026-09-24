'use client'

import { useActionState } from 'react'
import { login } from '../auth-actions'

export function LoginForm() {
  const [failure, formAction, pending] = useActionState(login, null)

  return (
    <form action={formAction}>
      <p>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </p>
      <p>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </p>
      {failure ? <p role="alert">{failure.error}</p> : null}
      <button type="submit" disabled={pending}>
        Entrar
      </button>
    </form>
  )
}
