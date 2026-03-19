import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { registerUser } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const { mutate, isLoading } = useMutation({
    mutationFn: registerUser,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success('Account created!')
      navigate('/')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Create account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter you name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your email id"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Atleast 6 charecters"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}