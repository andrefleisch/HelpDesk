import { DashboardPage } from "./pages/DashboardPage"
import { LoginPage } from "./pages/LoginPage"
import { TicketDetailsPage } from "./pages/TicketDetailsPage"
import { TicketsPage } from "./pages/TicketsPage"
import { ProtectedRoute } from "./routes/ProtectedRoute"
import { Navigate, Route, Routes } from "react-router-dom"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />
      </Route>
    </Routes>
  )
}
