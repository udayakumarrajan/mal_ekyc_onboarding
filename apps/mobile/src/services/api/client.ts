import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = 'http://localhost:3000';

class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}, retryCount: number = 0) {
    const session = useAuthStore.getState().session;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle 401 Unauthorized
      if (response.status === 401 && retryCount === 0 && !this.isRefreshing) {
        const errorCode = data?.error?.code;
        
        // Only try refresh for TOKEN_EXPIRED, not for invalid credentials
        if (errorCode === 'TOKEN_EXPIRED' && endpoint !== '/v1/auth/refresh') {
          try {
            this.isRefreshing = true;
            
            // Attempt to refresh token
            await useAuthStore.getState().refresh();
            
            this.isRefreshing = false;
            
            // Retry the original request with new token
            return this.request(endpoint, options, retryCount + 1);
          } catch (refreshError) {
            this.isRefreshing = false;
            // Refresh failed, user will be logged out by authStore
            throw refreshError;
          }
        }
      }

      if (!response.ok) {
        throw data;
      }

      return { data };
    } catch (error: any) {
      if (error.error) {
        throw error;
      }
      throw {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
        },
      };
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, body?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint: string, body?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
