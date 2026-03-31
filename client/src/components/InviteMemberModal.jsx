import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, UserPlus, Users, Crown, Eye, Pencil, Mail, Hash } from 'lucide-react'
import { addMember } from '../api/workspace.api'
import { sendInvite } from '../api/invite.api'
import toast from 'react-hot-toast'

const ROLE_STYLES = {
  admin:  { icon: <Crown size={13} />,  label: 'Admin',  class: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700' },
  editor: { icon: <Pencil size={13} />, label: 'Editor', class: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700' },
  viewer: { icon: <Eye size={13} />,    label: 'Viewer', class: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
}

export default function InviteMemberModal({ workspace, onClose }) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('email')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('editor')

  const { mutate: inviteByEmail, isPending: isSendingEmail } = useMutation({
    mutationFn: () => sendInvite({
      email,
      workspaceId: workspace._id,
      role
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces'])
      toast.success(`Invitation sent to ${email}!`)
      setEmail('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send invite')
    }
  })

  const { mutate: inviteById, isPending: isSendingId } = useMutation({
    mutationFn: () => addMember(workspace._id, { userId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces'])
      toast.success('Member added successfully!')
      setUserId('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add member')
    }
  })

  const handleSubmit = () => {
    if (tab === 'email') {
      if (!email.trim())
        return toast.error('Please enter an email address')
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email))
        return toast.error('Please enter a valid email address')
      inviteByEmail()
    } else {
      if (!userId.trim())
        return toast.error('Please enter a User ID')
      inviteById()
    }
  }

  const isPending = isSendingEmail || isSendingId

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Invite Member</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Workspace Badge */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: workspace.color }}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {workspace.name}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                tab === 'email'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Mail size={15} />
              Email Invite
            </button>
            <button
              onClick={() => setTab('userid')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                tab === 'userid'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Hash size={15} />
              User ID
            </button>
          </div>

          {/* Email Tab */}
          {tab === 'email' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="teammate@gmail.com"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                <Mail size={11} />
                They'll receive an email with a join link valid for 24 hours.
              </p>
            </div>
          )}

          {/* User ID Tab */}
          {tab === 'userid' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                User ID
              </label>
              <div className="relative">
                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Paste MongoDB User ID..."
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                <Hash size={11} />
                Ask teammate to copy their User ID from the sidebar.
              </p>
            </div>
          )}

          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ROLE_STYLES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition ${
                    role === key
                      ? `${val.class} border-current`
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {val.icon}
                  {val.label}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-400 dark:text-slate-500">
              <p><span className="font-medium text-amber-600 dark:text-amber-400">Admin</span> — full access, can manage members</p>
              <p><span className="font-medium text-blue-600 dark:text-blue-400">Editor</span> — can create and edit tasks</p>
              <p><span className="font-medium text-slate-500 dark:text-slate-400">Viewer</span> — read only access</p>
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={15} className="text-slate-400 dark:text-slate-500" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Members ({workspace.members?.length || 0})
              </label>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {workspace.members?.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold">
                      {member.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {member.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {member.user?.email || member.user}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_STYLES[member.role]?.class}`}>
                    {member.role}
                  </span>
                </div>
              ))}
              {workspace.members?.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">
                  No members yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {tab === 'email' ? <Mail size={15} /> : <UserPlus size={15} />}
            {isPending
              ? 'Sending...'
              : tab === 'email' ? 'Send Invite' : 'Add Member'
            }
          </button>
        </div>
      </div>
    </div>
  )
}