const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Helper function to handle API responses
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response:', text.substring(0, 200));
    throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
}

export const api = {
  // Token APIs
  async addToken(tokenData) {
    const response = await fetch(`${API_BASE_URL}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });
    return await handleResponse(response);
  },

  async getTokens() {
    const response = await fetch(`${API_BASE_URL}/tokens`);
    return await handleResponse(response);
  },

  async deleteToken(tokenId) {
    const response = await fetch(`${API_BASE_URL}/tokens/${tokenId}`, {
      method: 'DELETE',
    });
    return await handleResponse(response);
  },

  // Project APIs
  async saveProject(projectData) {
    const response = await fetch(`${API_BASE_URL}/projects/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    return await handleResponse(response);
  },

  async getUserProjects() {
    const response = await fetch(`${API_BASE_URL}/projects/user`);
    return await handleResponse(response);
  },

  async getProjectsByToken(tokenId) {
    const response = await fetch(`${API_BASE_URL}/projects/token/${tokenId}`);
    return await handleResponse(response);
  },

  async deleteProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
    });
    return await handleResponse(response);
  },

  async updateProjectColumns(projectUid, selectedColumns) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectUid}/columns`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selected_columns: selectedColumns }),
    });
    return await handleResponse(response);
  },

  async syncProject(projectId, token, submissions) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, submissions }),
    });
    return await handleResponse(response);
  },

  // Kobo API
  async fetchKoboProjects(tokenData) {
    const response = await fetch(`${API_BASE_URL}/kobo/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });
    return await handleResponse(response);
  }
};