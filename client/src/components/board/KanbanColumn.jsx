import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, X } from 'lucide-react'
import TaskCard from './TaskCard'

export default function KanbanColumn({
  column, tasks, onAddTask, onDeleteTask,
  onClickTask, showNewTask, setShowNewTask
}) {
  const [newTitle, setNewTitle] = useState('')
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleAdd = () => {
    if (!newTitle.trim()) return
    onAddTask(newTitle.trim())
    setNewTitle('')
    setShowNewTask(false)
  }

  return (
    <div className="flex flex-col w-72 flex-shrink-0">

      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{column.label}</span>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 min-h-96 transition-colors ${
          isOver
            ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300'
            : 'bg-slate-100 dark:bg-slate-800'
        }`}
      >
        {/* New Task Input */}
        {showNewTask && (
          <div className="mb-2 bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-600">
            <textarea
              autoFocus
              rows={2}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
                if (e.key === 'Escape') setShowNewTask(false)
              }}
              className="w-full text-sm resize-none focus:outline-none text-slate-700 dark:text-slate-200 bg-transparent"
              placeholder="Task title..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium py-1.5 rounded-lg transition"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowNewTask(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Task Cards */}
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onClickTask(task)}
                onDelete={() => onDeleteTask(task._id)}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && !showNewTask && (
          <div className="flex items-center justify-center h-32 text-slate-300 dark:text-slate-600 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}