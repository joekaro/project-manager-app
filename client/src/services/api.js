const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/auth/users`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/projects`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (projectData) => {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return response.json();
  },

  update: async (id, projectData) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  addMember: async (projectId, userId) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  removeMember: async (projectId, userId) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Tasks API
export const tasksAPI = {
  getByProject: async (projectId) => {
    const response = await fetch(`${API_URL}/tasks/projects/${projectId}/tasks`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (projectId, taskData) => {
    const response = await fetch(`${API_URL}/tasks/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    return response.json();
  },

  update: async (id, taskData) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Invitations API
export const invitationsAPI = {
  send: async (invitationData) => {
    const response = await fetch(`${API_URL}/invitations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invitationData)
    });
    return response.json();
  },

  getMy: async () => {
    const response = await fetch(`${API_URL}/invitations`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getByProject: async (projectId) => {
    const response = await fetch(`${API_URL}/invitations/project/${projectId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  accept: async (id) => {
    const response = await fetch(`${API_URL}/invitations/${id}/accept`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  decline: async (id) => {
    const response = await fetch(`${API_URL}/invitations/${id}/decline`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/invitations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Comments API
export const commentsAPI = {
  getByProject: async (projectId) => {
    const response = await fetch(`${API_URL}/comments/project/${projectId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (commentData) => {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(commentData)
    });
    return response.json();
  },

  update: async (id, commentData) => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(commentData)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};