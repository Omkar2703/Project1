import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import AcceptInvite from './pages/AcceptInvite'

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useAuthStore()
  return accessToken ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ✅ Public — no auth needed */}
        <Route path="/invite/accept" element={<AcceptInvite />} />

        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board/:projectId" element={<Board />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}