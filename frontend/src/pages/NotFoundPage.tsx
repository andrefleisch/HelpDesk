import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <main className="container py-5 text-center">
      <p className="display-1 fw-bold text-primary mb-2">404</p>
      <h1 className="h3">Página não encontrada</h1>
      <p className="text-secondary">O endereço informado não existe no HelpDesk.</p>
      <Link className="btn btn-primary" to="/dashboard">
        Voltar ao dashboard
      </Link>
    </main>
  )
}
