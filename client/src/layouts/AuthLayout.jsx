import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthLayout() {
  const { accessToken } = useAuthStore()

  if (accessToken) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">CollabFlow</h1>
          <p className="text-slate-500 mt-1">Collaborate, organize, deliver.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}