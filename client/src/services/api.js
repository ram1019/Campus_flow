const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

/**
 * Universal fetch wrapper for CampusFlow API
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, isFormData = false } = {}) {
  const token = localStorage.getItem('cf_token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { success: false, message: 'Invalid response from server' };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  getMe: () => apiRequest('/auth/me'),
  getStaff: () => apiRequest('/auth/staff'),

  // Complaints
  getComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/complaints${query ? `?${query}` : ''}`);
  },
  getComplaint: (id) => apiRequest(`/complaints/${id}`),
  createComplaint: (formData) => apiRequest('/complaints', { method: 'POST', body: formData, isFormData: true }),
  updateStatus: (id, formDataOrJson, isFormData = false) =>
    apiRequest(`/complaints/${id}/status`, { method: 'PATCH', body: formDataOrJson, isFormData }),
  assignComplaint: (id, data) => apiRequest(`/complaints/${id}/assign`, { method: 'PATCH', body: data }),
  submitFeedback: (id, data) => apiRequest(`/complaints/${id}/feedback`, { method: 'POST', body: data }),

  // Analytics
  getAnalytics: () => apiRequest('/analytics'),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
};
