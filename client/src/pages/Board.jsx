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
import { ArrowLeft, Plus } from 'lucide-react'
import { getTasks, createTask, updateTask, deleteTask } from '../api/task.api'
import { useProjectSocket } from '../hooks/useSocket'
import KanbanColumn from '../components/board/KanbanColumn'
import TaskCard from '../components/board/TaskCard'
import TaskModal from '../components/board/TaskModal'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#94a3b8' },
  { id: 'in-progress', label: 'In Progress',  color: '#f59e0b' },
  { id: 'review',      label: 'Review',       color: '#8b5cf6' },
  { id: 'done',        label: 'Done',         color: '#10b981' },
]

export default function Board() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTask, setActiveTask] = useState(null)      // task being dragged
  const [selectedTask, setSelectedTask] = useState(null)  // task modal open
  const [showNewTask, setShowNewTask] = useState(null)    // which column shows input

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ─── Fetch Tasks ────────────────────────────────────────────
  const { data: grouped = {}, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data } = await getTasks(projectId)
      return data
    }
  })

  // ─── Socket: real-time sync ──────────────────────────────────
  useProjectSocket(projectId, {
    onTaskCreated: (task) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => ({
        ...old,
        [task.status]: [...(old[task.status] || []), task]
      }))
    },
    onTaskUpdated: (task) => {
      queryClient.setQueryData(['tasks', projectId], (old = {}) => {
        // Remove from all columns first
        const updated = {}
        COLUMNS.forEach(col => {
          updated[col.id] = (old[col.id] || []).filter(t => t._id !== task._id)
        })
        // Add to correct column
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

  // ─── Mutations ────────────────────────────────────────────────
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

  // ─── Drag Handlers ────────────────────────────────────────────
  const handleDragStart = useCallback(({ active }) => {
    // Find the task being dragged across all columns
    for (const col of COLUMNS) {
      const found = (grouped[col.id] || []).find(t => t._id === active.id)
      if (found) { setActiveTask(found); break }
    }
  }, [grouped])

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const newStatus = over.id   // over.id = column id
    const taskId = active.id

    // Find current status
    let currentStatus = null
    for (const col of COLUMNS) {
      if ((grouped[col.id] || []).find(t => t._id === taskId)) {
        currentStatus = col.id
        break
      }
    }

    if (!currentStatus || currentStatus === newStatus) return

    // Optimistic update
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

  // ─── Render ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-200">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">Kanban Board</h1>
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

          {/* Drag overlay — ghost card while dragging */}
          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}