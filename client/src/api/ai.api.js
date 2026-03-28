import api from './axios'

export const breakdownGoal = (data) => api.post('/ai/breakdown', data)