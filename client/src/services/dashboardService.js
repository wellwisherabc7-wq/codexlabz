import api from './api';

export const getAdminDashboard = () =>
  api.get('/dashboard/admin').then((res) => res.data.data);

export const getClientDashboard = (clientId) =>
  api.get(`/dashboard/client/${clientId}`).then((res) => res.data.data);
