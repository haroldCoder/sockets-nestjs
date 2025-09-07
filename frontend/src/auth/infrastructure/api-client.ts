import axios, { AxiosInstance } from 'axios';
import { AuthRepository } from '../domain/auth.repository';
import { UserCredentials, UserRegistration, AuthResult } from '../domain/user.entity';
import { API_CONFIG } from '../../config/api.config';

export class ApiClient implements AuthRepository {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: UserCredentials): Promise<AuthResult> {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      
      if (response.data.status == 200) {
        localStorage.setItem('auth_token', response.data.token || 'dummy-token');
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        return {
          success: true,
          token: response.data.token || 'dummy-token',
          message: 'Login exitoso'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el login'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  async register(userData: UserRegistration): Promise<AuthResult> {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
      
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token || 'dummy-token');
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token || 'dummy-token',
          message: 'Registro exitoso'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el registro'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  async getCurrentUser(): Promise<{ id: string; username: string } | null> {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }
}
