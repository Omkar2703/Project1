import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { acceptInvite } from '../api/invite.api'
import { useAuthStore } from '../store/authStore'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invitation link.')
      return
    }

    // If not logged in, redirect to login with token in URL
    if (!accessToken) {
      navigate(`/login?inviteToken=${token}`)
      return
    }

    acceptInvite(token)
      .then(({ data }) => {
        setStatus('success')
        setWorkspaceName(data.workspaceName)
        setMessage(data.message)
        setTimeout(() => navigate('/'), 3000)
      })
      .catch((err) => {
        const data = err.response?.data
        if (data?.needsRegister) {
          setStatus('needsRegister')
          setRegisterEmail(data.email)
          setMessage(`Please register with ${data.email} first.`)
        } else {
          setStatus('error')
          setMessage(data?.message || 'Something went wrong.')
        }
      })
  }, [token, accessToken])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-primary-600 mb-8">CollabFlow</h1>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <Loader size={48} className="mx-auto text-primary-500 animate-spin mb-4" />
            <p className="text-slate-600">Accepting your invitation...</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">You're in! 🎉</h2>
            <p className="text-slate-500 mb-2">{message}</p>
            <p className="text-slate-400 text-sm">
              Added to <span className="font-medium text-slate-600">{workspaceName}</span>
            </p>
            <p className="text-xs text-slate-400 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <XCircle size={56} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Oops!</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {/* Needs Register */}
        {status === 'needsRegister' && (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Almost there!</h2>
            <p className="text-slate-500 mb-2">{message}</p>
            <p className="text-xs text-slate-400 mb-6">
              After registering, click the invite link again to join.
            </p>
            <button
              onClick={() => navigate(`/register?email=${registerEmail}&inviteToken=${token}`)}
              className="w-full bg-primary-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
            >
              Create Account →
            </button>
          </>
        )}
      </div>
    </div>
  )
}