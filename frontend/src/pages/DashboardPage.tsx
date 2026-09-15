import { Link } from "react-router-dom"
import { useAuth } from "../contexts/authContext"

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <main className="container py-4">
      <section className="card dashboard-hero rounded-4">
        <div className="card-body p-4 p-md-5">
          <h1 className="display-6 fw-bold mb-3">Bem-vindo, {user?.name}</h1>
          <p className="lead mb-0">
            Acompanhe seus tickets e mantenha cada atendimento atualizado em um só lugar.
          </p>
        </div>
      </section>

      <section className="row g-3 mt-3">
        <div className="col-md-4">
          <div className="card info-tile h-100 rounded-4">
            <div className="card-body">
              <h2 className="h6 text-secondary">ID</h2>
              <p className="small text-break mb-0">{user?.id}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card info-tile h-100 rounded-4">
            <div className="card-body">
              <h2 className="h6 text-secondary">Email</h2>
              <p className="mb-0">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card info-tile h-100 rounded-4">
            <div className="card-body">
              <h2 className="h6 text-secondary">Atendimento</h2>
              <Link className="btn btn-primary btn-sm" to="/tickets">
                Acessar tickets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
