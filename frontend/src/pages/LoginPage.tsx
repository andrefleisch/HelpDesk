import { FormEvent, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import { useAuth } from "../contexts/authContext"

type ApiErrorResponse = {
  message?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // se já existe usuário logado, manda para dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await login({ email, password })
      navigate("/dashboard")
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiErrorResponse | undefined
        setError(responseData?.message ?? "Não foi possível fazer login. Verifique sua conexão e tente novamente.")
      } else {
        setError("Não foi possível fazer login. Verifique sua conexão e tente novamente.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-shell d-flex align-items-center justify-content-center px-3 py-5">
      <section className="card auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4">
            <span className="brand-mark mb-3">HD</span>
            <h1 className="h3 mb-2">Entrar no HelpDesk</h1>
            <p className="text-secondary mb-0">
              Acesse sua conta para acompanhar e gerenciar atendimentos.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                className="form-control"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="password">
                Senha
              </label>
              <input
                className="form-control"
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
