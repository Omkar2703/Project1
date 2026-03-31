import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthLayout() {
  const { accessToken } = useAuthStore()
  if (accessToken) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">CollabFlow</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Collaborate, organize, deliver.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-colors">
          <Outlet />
        </div>
      </div>
    </div>
  )
}