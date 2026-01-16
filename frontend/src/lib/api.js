import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Clients API
export const clientsApi = {
  getAll: (params = {}) => axios.get(`${API_URL}/clients`, { params }),
  getOne: (id) => axios.get(`${API_URL}/clients/${id}`),
  create: (data) => axios.post(`${API_URL}/clients`, data),
  update: (id, data) => axios.put(`${API_URL}/clients/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/clients/${id}`),
};

// Visits API
export const visitsApi = {
  getByClient: (clientId, params = {}) => axios.get(`${API_URL}/clients/${clientId}/visits`, { params }),
  create: (clientId, data) => axios.post(`${API_URL}/clients/${clientId}/visits`, data),
  update: (visitId, data) => axios.put(`${API_URL}/visits/${visitId}`, data),
  delete: (visitId) => axios.delete(`${API_URL}/visits/${visitId}`),
};

// Stats API
export const statsApi = {
  getOverview: (params = {}) => axios.get(`${API_URL}/stats/overview`, { params }),
  getClientStats: (clientId, params = {}) => axios.get(`${API_URL}/stats/client/${clientId}`, { params }),
  getTopicsStats: (params = {}) => axios.get(`${API_URL}/stats/topics`, { params }),
  getYearlySummary: (year) => axios.get(`${API_URL}/stats/yearly-summary`, { params: { year } }),
};

// Topics API
export const topicsApi = {
  getAll: () => axios.get(`${API_URL}/topics`),
};

// Retreats API
export const retreatsApi = {
  getAll: (params = {}) => axios.get(`${API_URL}/retreats`, { params }),
  getOne: (id) => axios.get(`${API_URL}/retreats/${id}`),
  create: (data) => axios.post(`${API_URL}/retreats`, data),
  update: (id, data) => axios.put(`${API_URL}/retreats/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/retreats/${id}`),
  addParticipant: (retreatId, data) => axios.post(`${API_URL}/retreats/${retreatId}/participants`, data),
  updateParticipant: (retreatId, clientId, data) => axios.put(`${API_URL}/retreats/${retreatId}/participants/${clientId}`, data),
  removeParticipant: (retreatId, clientId) => axios.delete(`${API_URL}/retreats/${retreatId}/participants/${clientId}`),
  addExpense: (retreatId, data) => axios.post(`${API_URL}/retreats/${retreatId}/expenses`, data),
  removeExpense: (retreatId, expenseId) => axios.delete(`${API_URL}/retreats/${retreatId}/expenses/${expenseId}`),
  getStats: (params = {}) => axios.get(`${API_URL}/stats/retreats`, { params }),
};
