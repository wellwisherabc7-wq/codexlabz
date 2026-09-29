import api from './api';

export const getClients = () => api.get('/clients').then((res) => res.data.data);

export const getClient = (id) => api.get(`/clients/${id}`).then((res) => res.data.data);

export const createClient = (payload) =>
  api.post('/clients', payload).then((res) => res.data.data);

export const updateClient = (id, payload) =>
  api.patch(`/clients/${id}`, payload).then((res) => res.data.data);

export const deleteClient = (id) => api.delete(`/clients/${id}`).then((res) => res.data.data);

export const getClientProjects = (id) =>
  api.get(`/clients/${id}/projects`).then((res) => res.data.data);
