import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import toast from 'react-hot-toast'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { getTasks, createTask, updateTask, deleteTask } from '../api/task.api'
import { useProjectSocket } from '../hooks/useSocket'
import KanbanColumn from '../components/board/KanbanColumn'
import TaskCard from '../components/board/TaskCard'
import TaskModal from '../components/board/TaskModal'
import AIBreakdownModal from '../components/board/AIBreakdownModal'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',      color: '#94a3b8' },
  { id: 'in-progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'review',      label: 'Review',      color: '#8b5cf6' },
  { id: 'done',        label: 'Done',        color: '#10b981' },
]

export default function Board() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showNewTask, setShowNewTask] = useState(null)
  const [showAI, setShowAI] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const { data: grouped = {}, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data } = await getTasks(projectId)
      return data
    }
  })

  useProjectSocket(projectId, {
    onTaskCreated: (task) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => ({
        ...old,
        [task.status]: [...(old[task.status] || []), task]
      }))
    },
    onTaskUpdated: (task) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => {
        const updated = {}
        COLUMNS.forEach(col => {
          updated[col.id] = (old[col.id] || []).filter(t => t._id !== task._id)
        })
        updated[task.status] = [...(updated[task.status] || []), task]
        return updated
      })
    },
    onTaskDeleted: (taskId) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => {
        const updated = {}
        COLUMNS.forEach(col => {
          updated[col.id] = (old[col.id] || []).filter(t => t._id !== taskId)
        })
        return updated
      })
    }
  })

  const { mutate: addTask } = useMutation({
    mutationFn: ({ title, status }) => createTask(projectId, { title, status }),
    onSuccess: ({ data: task }) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => ({
        ...old,
        [task.status]: [...(old[task.status] || []), task]
      }))
      setShowNewTask(null)
      toast.success('Task created!')
    }
  })

  const { mutate: moveTask } = useMutation({
    mutationFn: ({ taskId, status }) => updateTask(taskId, { status }),
    onError: () => {
      queryClient.invalidateQueries(['tasks', projectId])
      toast.error('Failed to move task')
    }
  })

  const { mutate: removeTask } = useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, taskId) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => {
        const updated = {}
        COLUMNS.forEach(col => {
          updated[col.id] = (old[col.id] || []).filter(t => t._id !== taskId)
        })
        return updated
      })
      toast.success('Task deleted')
    }
  })

  const handleDragStart = useCallback(({ active }) => {
    for (const col of COLUMNS) {
      const found = (grouped[col.id] || []).find(t => t._id === active.id)
      if (found) { setActiveTask(found); break }
    }
  }, [grouped])

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const newStatus = over.id
    const taskId = active.id

    let currentStatus = null
    for (const col of COLUMNS) {
      if ((grouped[col.id] || []).find(t => t._id === taskId)) {
        currentStatus = col.id
        break
      }
    }

    if (!currentStatus || currentStatus === newStatus) return

    queryClient.setQueryData(['tasks', projectId], (old = {}) => {
      const task = (old[currentStatus] || []).find(t => t._id === taskId)
      if (!task) return old
      return {
        ...old,
        [currentStatus]: old[currentStatus].filter(t => t._id !== taskId),
        [newStatus]: [...(old[newStatus] || []), { ...task, status: newStatus }]
      }
    })

    moveTask({ taskId, status: newStatus })
  }, [grouped, projectId, queryClient, moveTask])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex-1">
          Kanban Board
        </h1>
        <button
          onClick={() => setShowAI(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Sparkles size={16} />
          AI Breakdown
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={grouped[col.id] || []}
                onAddTask={(title) => addTask({ title, status: col.id })}
                onDeleteTask={removeTask}
                onClickTask={setSelectedTask}
                showNewTask={showNewTask === col.id}
                setShowNewTask={(v) => setShowNewTask(v ? col.id : null)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showAI && (
        <AIBreakdownModal
          projectId={projectId}
          onClose={() => setShowAI(false)}
          onTasksCreated={(tasks) => {
            tasks.forEach(task => {
              // socket?.emit('task-created', { projectId, task })
            })
          }}
        />
      )}
    </div>
  )
}