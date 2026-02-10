/**
 * API Service for Backend Communication
 * Handles all API calls to the backend server
 */

// Use a relative '/api' default so Vite dev server proxy forwards requests to the backend
// When building for production set VITE_API_BASE_URL to your API host (e.g. https://api.example.com)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;

  };
  token?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    name: string;
    email?: string;
    role: string;
    staffId?: string;
    staff_id?: string;
    department?: string;
  };
  message?: string;
}

class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = 'API_ERROR', status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Get authorization token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Save authorization token to localStorage
 */
function saveAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

/**
 * Save refresh token to localStorage
 */
function saveRefreshToken(token: string): void {
  localStorage.setItem('refresh_token', token);
}

/**
 * Remove authorization token from localStorage
 */
function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}

/**
 * Make API request with automatic token handling
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Handle mock tokens for development - skip actual API calls
  if (token && token.startsWith('mock_token_')) {
    // For development, skip authentication for mock tokens
    // This allows the app to work without a backend
    console.log(`[MOCK API] ${options.method || 'GET'} ${endpoint} - Mock response`);
    return {
      success: true,
      data: {} as T,
      message: 'Mock response'
    };
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: headers as HeadersInit,
      credentials: 'include',
    });

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    let data: ApiResponse<T>;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        const text = await response.text();
        console.error('Response text:', text);
        throw new ApiError(
          'Invalid response from server',
          'PARSE_ERROR',
          response.status
        );
      }
    } else {
      // If not JSON, try to get text
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new ApiError(
        text || 'Invalid response from server',
        'INVALID_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        endpoint,
        error: data.error
      });
      throw new ApiError(
        data.error?.message || 'Request failed',
        data.error?.code || 'REQUEST_ERROR',
        response.status
      );
    }

    // Save token if provided in response
    if (data.token) {
      saveAuthToken(data.token);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network error or other fetch errors
    console.error('Fetch error:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error. Please check your connection.',
      'NETWORK_ERROR',
      0
    );
  }
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   */
  async login(username: string, password: string, role: string) {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
    return response;
  },

  /**
   * Register new user
   */
  async register(userData: {
    name: string;
    email: string;
    phone?: string;
    staffId: string;
    role: string;
    department?: string;
    password: string;
  }) {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
        staffId: userData.staffId,
        role: userData.role,
        department: userData.department,
        password: userData.password,
      }),
    });
    return response;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Refresh access token
   */
  async refresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 'NO_REFRESH_TOKEN', 401);
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || 'Refresh failed',
        data.error?.code || 'REFRESH_ERROR',
        response.status
      );
    }

    // Save new tokens
    if (data.token) {
      saveAuthToken(data.token);
    }
    if (data.refreshToken) {
      saveRefreshToken(data.refreshToken);
    }

    return data;
  },
};

/**
 * Cases API
 */
export const casesApi = {
  /**
   * Get all cases with filters
   */
  async getCases(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
    assignedTo?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/cases?${queryString}` : '/cases';
    return request(endpoint);
  },

/**
 * Get case by ID (with proper encoding for IDs containing slashes)
 */
async getCaseById(id: string) {
  return request(`/cases/${encodeURIComponent(id)}`);
},

  /**
   * Create new case
   */
  async createCase(caseData: {
    title: string;
    type: string;
    description?: string;
    priority?: string;
    parties?: Array<{
      role: string;
      name: string;
      lawyerId?: string;
    }>;
    nextHearing?: string;
  }) {
    return request('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  /**
   * Update case
   */
  async updateCase(id: string, updates: Partial<{
    title: string;
    status: string;
    priority: string;
    description: string;
    nextHearing: string;
  }>) {
    return request(`/cases/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete case
   */
  async deleteCase(id: string) {
    return request(`/cases/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Assign lawyer to case
   */
  async assignLawyerToCase(caseId: string, lawyerId: string) {
    return request(`/cases/${encodeURIComponent(caseId)}/assign-lawyer`, {
      method: 'PUT',
      body: JSON.stringify({ lawyerId }),
    });
  },

  /**
   * Request case assignment (lawyers only)
   */
  async requestCaseAssignment(caseId: string) {
    return request(`/cases/${encodeURIComponent(caseId)}/request-assignment`, {
      method: 'POST',
    });
  },
};

/**
 * Documents API
 */
export const documentsApi = {
  /**
   * Get all documents with filters
   */
  async getDocuments(params?: {
    caseId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/documents?${queryString}` : '/documents';
    return request(endpoint);
  },

  /**
   * Upload document
   */
  async uploadDocument(file: File, caseId: string, type: string, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('type', type);
    if (description) {
      formData.append('description', description);
    }

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || 'Upload failed',
        data.error?.code || 'UPLOAD_ERROR',
        response.status
      );
    }

    return data;
  },
};

/**
 * Users API
 */
export const usersApi = {
  /**
   * Get all users
   */
  async getUsers(params?: {
    role?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return request(endpoint);
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    return request('/users/profile');
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    return request(`/users/${id}`);
  },

  /**
   * Update user
   */
  async updateUser(id: string, updates: {
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
  }) {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Approve user registration
   */
  async approveUser(id: string, staffId?: string) {
    return request(`/users/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved: true, staffId }),
    });
  },

  /**
   * Get list of lawyers
   */
  async getLawyers() {
    return request('/users/lawyers');
  },

  /**
   * Get list of judges
   */
  async getJudges() {
    return request('/users/judges');
  },

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Assign lawyer to case
   */
  async assignLawyerToCase(caseId: string, lawyerId: string) {
    return request(`/cases/${caseId}/assign-lawyer`, {
      method: 'PUT',
      body: JSON.stringify({ lawyerId }),
    });
  },
};

/**
 * Reports API
 */
export const reportsApi = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return request('/reports/dashboard-stats');
  },

  /**
   * Get case statistics
   */
  async getCaseStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reports/case-statistics?${queryString}` : '/reports/case-statistics';
    return request(endpoint);
  },
};

export { ApiError, getAuthToken, removeAuthToken, saveRefreshToken };
