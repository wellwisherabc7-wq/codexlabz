import api from './api';

export const updateTask = (id, payload) =>
  api.patch(`/tasks/${id}`, payload).then((res) => res.data.data);

export const deleteTask = (id) => api.delete(`/tasks/${id}`).then((res) => res.data.data);
