import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let socketInstance = null

export const useSocket = () => {
  const { accessToken } = useAuthStore()

  if (!socketInstance && accessToken) {
    socketInstance = io('/', {
      auth: { token: accessToken }
    })
  }

  return socketInstance
}

export const useProjectSocket = (projectId, handlers = {}) => {
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !projectId) return

    socket.emit('join-project', projectId)

    if (handlers.onTaskCreated) socket.on('task-created', handlers.onTaskCreated)
    if (handlers.onTaskUpdated) socket.on('task-updated', handlers.onTaskUpdated)
    if (handlers.onTaskDeleted) socket.on('task-deleted', handlers.onTaskDeleted)

    return () => {
      socket.emit('leave-project', projectId)
      socket.off('task-created')
      socket.off('task-updated')
      socket.off('task-deleted')
    }
  }, [projectId, socket])
}