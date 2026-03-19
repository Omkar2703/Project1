import api from './axios'

export const getWorkspaces = (data) => api.get('/workspaces', data)
export const createWorkspace = (data) => api.post('/workspaces', data)
export const deleteWorkspace = (id) => api.delete(`/workspaces/${id}`)
export const addMember = (id, data) => api.post(`/workspaces/${id}/members`, data)