import api from './axios'

export const sendInvite = (data) => api.post('/invites/send', data)
export const acceptInvite = (token) => api.get(`/invites/accept?token=${token}`)
export const getWorkspaceInvites = (workspaceId) => api.get(`/invites/workspace/${workspaceId}`)
export const cancelInvite = (id) => api.delete(`/invites/${id}`)