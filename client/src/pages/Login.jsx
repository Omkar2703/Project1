import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { loginUser } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('inviteToken')  // ✅ grab invite token
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success(`Welcome back, ${data.user.name}!`)
      // ✅ if came from invite link, redirect back to accept
      if (inviteToken) {
        navigate(`/invite/accept?token=${inviteToken}`)
      } else {
        navigate('/')
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign in</h2>
      {inviteToken && (
        <p className="text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg mb-4">
          🎉 Sign in to accept your workspace invitation!
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your registered email id"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </>
  )
}