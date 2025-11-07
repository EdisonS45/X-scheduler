import axios from 'axios'

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' 
})

// --- Request Interceptor (Adds the token) ---
API.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
  }
  return config;
});

// --- Response Interceptor (Handles 401 Errors) ---
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Auth Error 401. Logging out.");
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// --- Auth ---
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (email, password) => API.post('/auth/register', { email, password });

// --- Projects ---
// getProjects now returns { active, pendingStopped, completed }
export const getProjects = () => API.get('/projects');
export const getProjectById = (projectId) => API.get(`/projects/${projectId}`);
export const createProject = (data) => API.post('/projects', data);
export const deleteProject = (projectId) => API.delete(`/projects/${projectId}`);
export const deleteBulkProjects = (projectIds) => API.post('/projects/delete-bulk', { projectIds }); // --- New
export const uploadCSV = (projectId, formData) => API.post(`/projects/${projectId}/upload-csv`, formData);

// --- Scheduler ---
export const startProject = (projectId) => API.post(`/projects/${projectId}/start`);
export const pauseProject = (projectId) => API.post(`/projects/${projectId}/pause`);
export const stopProject = (projectId) => API.post(`/projects/${projectId}/stop`);

// --- Templates (All New) ---
export const getTemplates = () => API.get('/templates');
export const createTemplate = (data) => API.post('/templates', data);
export const deleteTemplate = (templateId) => API.delete(`/templates/${templateId}`);
export const createProjectFromTemplate = (templateId, formData) => API.post(`/templates/${templateId}/create-project`, formData);