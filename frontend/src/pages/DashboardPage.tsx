import { useAuth } from "../contexts/authContext"

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main className="container py-4">
      <nav className="navbar navbar-expand rounded-4 bg-white px-3 shadow-sm">
        <span className="navbar-brand fw-bold mb-0">HelpDesk</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="badge text-bg-primary">{user?.role}</span>
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={logout}>
            Sair
          </button>
        </div>
      </nav>

      <section className="card dashboard-hero mt-4 rounded-4">
        <div className="card-body p-4 p-md-5">
          <p className="text-white-50 mb-2">Usuario autenticado</p>
          <h1 className="display-6 fw-bold mb-3">Bem-vindo, {user?.name}</h1>
          <p className="lead mb-0">
            O frontend fez login, salvou o token, chamou <code>/auth/me</code> e renderizou esta
            area protegida com os dados do usuario autenticado.
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
              <h2 className="h6 text-secondary">Proximo passo</h2>
              <p className="mb-0">Listar tickets usando o token salvo.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
