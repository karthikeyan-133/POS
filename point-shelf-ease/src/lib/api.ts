// API configuration and client
const getApiBaseUrl = () => {
  // In production, use environment variable or default to relative API
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || '/api';
  }
  // In development, use local backend
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// HTTP client with authentication
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async get(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async post(endpoint: string, data?: any, isFormData = false) {
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async put(endpoint: string, data?: any, isFormData = false) {
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }
}

// Create the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Auth API functions
export const authApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async googleSignIn(credential: string) {
    const response = await apiClient.post('/auth/google-signin', { credential });
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async register(email: string, password: string, fullName: string, role = 'cashier') {
    const response = await apiClient.post('/auth/register', { 
      email, 
      password, 
      fullName, 
      role 
    });
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.clearToken();
    }
  },

  async getProfile() {
    return apiClient.get('/auth/profile');
  }
};

// Health check
export const healthApi = {
  async check() {
    return apiClient.get('/health');
  }
};