import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Check } from 'lucide-react'
import { updateTask } from '../../api/task.api'
import toast from 'react-hot-toast'

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_STYLES = {
  low:    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  medium: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  high:   'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700'
}

export default function TaskModal({ task, projectId, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    subtasks: task.subtasks || []
  })
  const [newSubtask, setNewSubtask] = useState('')

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data) => updateTask(task._id, data),
    onSuccess: ({ data: updated }) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => {
        const updated2 = {}
        Object.keys(old).forEach(col => {
          updated2[col] = old[col].map(t => t._id === updated._id ? updated : t)
        })
        return updated2
      })
      toast.success('Task updated!')
      onClose()
    },
    onError: () => toast.error('Failed to update task')
  })

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setForm(f => ({
      ...f,
      subtasks: [...f.subtasks, { title: newSubtask.trim(), completed: false }]
    }))
    setNewSubtask('')
  }

  const toggleSubtask = (index) => {
    setForm(f => ({
      ...f,
      subtasks: f.subtasks.map((s, i) =>
        i === index ? { ...s, completed: !s.completed } : s
      )
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Edit Task</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={18} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              placeholder="Add a description..."
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-lg border capitalize transition ${
                      form.priority === p
                        ? PRIORITY_STYLES[p]
                        : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Subtasks ({form.subtasks.filter(s => s.completed).length}/{form.subtasks.length})
            </label>
            <div className="space-y-2 mb-2">
              {form.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                  <button
                    onClick={() => toggleSubtask(index)}
                    className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition ${
                      subtask.completed
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 dark:border-slate-500 hover:border-primary-400'
                    }`}
                  >
                    {subtask.completed && <Check size={11} className="text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${
                    subtask.completed
                      ? 'line-through text-slate-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="Add subtask..."
              />
              <button
                onClick={addSubtask}
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition"
              >
                <Plus size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => save(form)}
            disabled={isPending}
            className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
