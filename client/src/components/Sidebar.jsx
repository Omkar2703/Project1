import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, User, Copy } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { logoutUser } from '../api/auth.api'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logoutUser()
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.id)
    toast.success('User ID copied to clipboard!')
  }

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
  ]

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-primary-600">CollabFlow</h1>
        <p className="text-xs text-slate-400 mt-0.5">Collaborate & deliver</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-100 space-y-1">

        {/* Avatar + Name + Email */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Copy User ID */}
        <button
          onClick={handleCopyId}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
        >
          <Copy size={16} />
          Copy my User ID
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>
    </aside>
  )
}