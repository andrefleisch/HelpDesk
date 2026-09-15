import { DashboardPage } from "./pages/DashboardPage"
import { LoginPage } from "./pages/LoginPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { TicketDetailsPage } from "./pages/TicketDetailsPage"
import { TicketsPage } from "./pages/TicketsPage"
import { ProtectedRoute } from "./routes/ProtectedRoute"
import { AppLayout } from "./components/AppLayout"
import { Navigate, Route, Routes } from "react-router-dom"

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
