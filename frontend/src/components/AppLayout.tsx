import { NavLink, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/authContext"

export function AppLayout() {
  const { user, logout } = useAuth()

  function getNavLinkClass({ isActive }: { isActive: boolean }) {
    if (isActive) {
      return "nav-link active fw-semibold"
    }

    return "nav-link"
  }

  return (
    <>
      <header className="container pt-4">
        <nav className="navbar navbar-expand-lg rounded-4 bg-white px-3 shadow-sm">
          <NavLink className="navbar-brand fw-bold" to="/dashboard">
            HelpDesk
          </NavLink>

          <div className="navbar-nav flex-row gap-2">
            <NavLink className={getNavLinkClass} to="/dashboard">
              Dashboard
            </NavLink>
            <NavLink className={getNavLinkClass} to="/tickets">
              Tickets
            </NavLink>
          </div>

          <div className="ms-auto d-flex align-items-center gap-3">
            <span className="badge text-bg-primary">{user?.role}</span>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={logout}>
              Sair
            </button>
          </div>
        </nav>
      </header>

      <Outlet />
    </>
  )
}
