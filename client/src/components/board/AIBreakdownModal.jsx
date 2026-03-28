import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Sparkles, Loader, CheckCircle } from 'lucide-react'
import { breakdownGoal } from '../../api/ai.api'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low:    'bg-slate-100 text-slate-500'
}

export default function AIBreakdownModal({ projectId, onClose, onTasksCreated }) {
  const queryClient = useQueryClient()
  const [goal, setGoal] = useState('')
  const [preview, setPreview] = useState(null)   // show tasks before adding

  const { mutate: breakdown, isPending } = useMutation({
    mutationFn: () => breakdownGoal({ goal, projectId }),
    onSuccess: ({ data }) => {
      // Update board instantly with new tasks
      queryClient.setQueryData(['tasks', projectId], (old = {}) => ({
        ...old,
        todo: [...(old.todo || []), ...data.tasks]
      }))
      toast.success(data.message)
      onTasksCreated(data.tasks)
      onClose()
    },
// ✅ New
    onError: (err) => {
    const msg = err.response?.data?.message || 'AI breakdown failed'
    if (err.response?.status === 429) {
        toast.error('AI is busy right now — please wait a moment and try again! ⏳')
    } else {
        toast.error(msg)
    }
    }
  })

  const handleSubmit = () => {
    if (!goal.trim())
      return toast.error('Please enter a goal')
    if (goal.trim().length < 10)
      return toast.error('Please enter a more detailed goal')
    breakdown()
  }

  const examples = [
    'Build user authentication system',
    'Create a dashboard with analytics',
    'Implement payment gateway integration',
    'Design and build REST API for mobile app',
    'Set up CI/CD pipeline for deployment'
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">AI Task Breakdown</h2>
              <p className="text-xs text-slate-400">Powered by Mistral AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Goal Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What's your goal?
            </label>
            <textarea
              rows={3}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              placeholder="e.g. Build a user authentication system with login, register and JWT tokens..."
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">
              Be specific — AI will break this into 5-8 actionable tasks
            </p>
          </div>

          {/* Example Goals */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">
              💡 Try an example:
            </p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setGoal(ex)}
                  className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-200 hover:border-primary-200 rounded-lg transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* What Claude will do */}
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-xs font-medium text-primary-700 mb-2">
              ✨ AI agent will automatically:
            </p>
            <ul className="space-y-1">
              {[
                'Break your goal into 5-8 specific tasks',
                'Write clear descriptions for each task',
                'Assign smart priority levels',
                'Add all tasks to your Todo column instantly'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-primary-600">
                  <CheckCircle size={12} className="flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !goal.trim()}
            className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader size={15} className="animate-spin" />
                AI is thinking...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate Tasks
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}