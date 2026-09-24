import { logout } from './auth-actions'

export default function HomePage() {
  return (
    <main>
      <h1>Rio Negro · Admin</h1>
      <form action={logout}>
        <button type="submit">Sair</button>
      </form>
    </main>
  )
}
