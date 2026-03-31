import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Copy, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { logoutUser } from '../api/auth.api'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()

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
    <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen transition-colors">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
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
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-1">

        {/* Avatar + Name + Email */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          {isDark
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} className="text-slate-500" />
          }
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Copy User ID */}
        <button
          onClick={handleCopyId}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <Copy size={16} />
          Copy my User ID
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}