import axios from 'axios'
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' })

export const createProject = (data) => API.post('/projects', data)
export const uploadCSV = (projectId, formData) => API.post(`/projects/${projectId}/upload-csv`, formData)
export const startProject = (projectId) => API.post(`/projects/${projectId}/start`)
export const getProjects = () => API.get('/projects')