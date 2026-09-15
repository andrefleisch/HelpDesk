import { NavLink, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import { USER_ROLE_LABELS } from "../constants/domainLabels"

export function AppLayout() {
  const { user, logout } = useAuth()
  let userRoleContent = null

  if (user) {
    userRoleContent = <span className="badge text-bg-primary">{USER_ROLE_LABELS[user.role]}</span>
  }

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
            {userRoleContent}
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
