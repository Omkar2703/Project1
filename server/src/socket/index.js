export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`)

    socket.on('join-project', (projectId) => {
      socket.join(projectId)
      console.log(`User joined project room: ${projectId}`)
    })

    socket.on('leave-project', (projectId) => {
      socket.leave(projectId)
    })

    socket.on('task-created', ({ projectId, task }) => {
      socket.to(projectId).emit('task-created', task)
    })

    socket.on('task-updated', ({ projectId, task }) => {
      socket.to(projectId).emit('task-updated', task)
    })

    socket.on('task-deleted', ({ projectId, taskId }) => {
      socket.to(projectId).emit('task-deleted', taskId)
    })

    socket.on('user-viewing', ({ projectId, user }) => {
      socket.to(projectId).emit('user-viewing', user)
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })
}
