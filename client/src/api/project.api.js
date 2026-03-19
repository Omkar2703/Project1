import api from './axios'

export const getProjects = (workspaceId) => api.get(`/workspaces/${workspaceId}/projects`)
export const createProject = (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)