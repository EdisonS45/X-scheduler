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
    // You could also clear storage here
  }
  return config;
});

// --- NEW: Response Interceptor (Handles 401 Errors) ---
API.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // This is an unauthorized request.
      console.error("Auth Error 401. Logging out.");
      localStorage.removeItem('user');
      // Use window.location to force a full page refresh and context reset.
      window.location.href = '/login';
    }
    // Return the error so the calling component can still handle it (e.g., show a message)
    return Promise.reject(error);
  }
);
// --- End of New Interceptor ---


// --- Auth ---
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (email, password) => API.post('/auth/register', { email, password });

// --- Projects ---
export const getProjects = () => API.get('/projects');
export const getProjectById = (projectId) => API.get(`/projects/${projectId}`);
export const createProject = (data) => API.post('/projects', data);
export const deleteProject = (projectId) => API.delete(`/projects/${projectId}`);
export const uploadCSV = (projectId, formData) => API.post(`/projects/${projectId}/upload-csv`, formData);

// --- Scheduler ---
export const startProject = (projectId) => API.post(`/projects/${projectId}/start`);
export const pauseProject = (projectId) => API.post(`/projects/${projectId}/pause`);
export const stopProject = (projectId) => API.post(`/projects/${projectId}/stop`);