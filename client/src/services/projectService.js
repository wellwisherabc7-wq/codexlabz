import api from './api';

export const getProjects = () => api.get('/projects').then((res) => res.data.data);

export const getProject = (id) => api.get(`/projects/${id}`).then((res) => res.data.data);

export const createProject = (payload) =>
  api.post('/projects', payload).then((res) => res.data.data);

export const updateProject = (id, payload) =>
  api.patch(`/projects/${id}`, payload).then((res) => res.data.data);

export const deleteProject = (id) => api.delete(`/projects/${id}`).then((res) => res.data.data);

export const getProjectTasks = (id) =>
  api.get(`/projects/${id}/tasks`).then((res) => res.data.data);

export const createProjectTask = (id, payload) =>
  api.post(`/projects/${id}/tasks`, payload).then((res) => res.data.data);
