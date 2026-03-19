import api from './axios'

export const getTasks = (projectId) => api.get(`/projects/${projectId}/tasks`)
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data)
export const updateTask = (taskId, data) => api.patch(`/projects/tasks/${taskId}`, data)      // ✅ updated
export const deleteTask = (taskId) => api.delete(`/projects/tasks/${taskId}`)                  // ✅ updated
export const toggleSubtask = (taskId, data) => api.patch(`/projects/tasks/${taskId}/subtasks`, data) // ✅ updated