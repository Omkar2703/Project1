import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const PRIORITY_STYLES = {
  low:    'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  high:   'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
}

export default function TaskCard({ task, onClick, onDelete, isDragging }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging: isSortableDragging
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing group
        ${isDragging ? 'shadow-xl rotate-2 scale-105' : 'hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-md'}
        transition-all`}
    >
      {/* Priority + Delete */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-300 hover:text-red-500 transition"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Title */}
      <p
        className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 leading-snug cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        {task.title}
      </p>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Subtasks</span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-600 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 mt-2">
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={11} />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
        {task.assignee && (
          <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold">
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
          </span>
        )}
      </div>
    </div>
  )
}