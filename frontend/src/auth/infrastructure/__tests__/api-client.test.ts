import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { ApiClient } from '../api-client'
import { UserCredentials, UserRegistration } from '../../domain/user.entity'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('ApiClient', () => {
  let apiClient: ApiClient
  let mockAxiosInstance: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    mockedAxios.create.mockReturnValue(mockAxiosInstance)
    apiClient = new ApiClient('http:
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('debería crear una instancia de axios con la configuración correcta', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http:
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('debería configurar interceptors de request y response', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('debería hacer login exitoso y guardar token en localStorage', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      const mockResponse = {
        data: {
          status: 200,
          message: 'Login exitoso',
          token: 'jwt-token',
          user: { id: '1', username: 'testuser' }
        }
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await apiClient.login(credentials)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/login', credentials)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'jwt-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockResponse.data.user))
      expect(result).toEqual({
        success: true,
        token: 'jwt-token',
        message: 'Login exitoso'
      })
    })

    it('debería manejar login fallido', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'wrongpassword'
      }

      const mockResponse = {
        data: {
          status: 401,
          message: 'Credenciales inválidas'
        }
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await apiClient.login(credentials)

      expect(result).toEqual({
        success: false,
        message: 'Credenciales inválidas'
      })
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('debería manejar errores de red', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      const networkError = {
        response: {
          data: {
            message: 'Error de conexión'
          }
        }
      }

      mockAxiosInstance.post.mockRejectedValue(networkError)

      const result = await apiClient.login(credentials)

      expect(result).toEqual({
        success: false,
        message: 'Error de conexión'
      })
    })

    it('debería manejar errores sin response', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'))

      const result = await apiClient.login(credentials)

      expect(result).toEqual({
        success: false,
        message: 'Error de conexión'
      })
    })
  })

  describe('register', () => {
    it('debería hacer registro exitoso y guardar datos en localStorage', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'newuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const mockResponse = {
        data: {
          success: true,
          message: 'Registro exitoso',
          token: 'jwt-token',
          user: { id: '1', username: 'newuser' }
        }
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await apiClient.register(userData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/register', userData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'jwt-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockResponse.data.user))
      expect(result).toEqual({
        success: true,
        user: { id: '1', username: 'newuser' },
        token: 'jwt-token',
        message: 'Registro exitoso'
      })
    })

    it('debería manejar registro fallido', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'existinguser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const mockResponse = {
        data: {
          success: false,
          message: 'El usuario ya existe'
        }
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await apiClient.register(userData)

      expect(result).toEqual({
        success: false,
        message: 'El usuario ya existe'
      })
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('debería manejar errores de red en registro', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'newuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const networkError = {
        response: {
          data: {
            message: 'Error de conexión'
          }
        }
      }

      mockAxiosInstance.post.mockRejectedValue(networkError)

      const result = await apiClient.register(userData)

      expect(result).toEqual({
        success: false,
        message: 'Error de conexión'
      })
    })
  })

  describe('logout', () => {
    it('debería limpiar localStorage al hacer logout', async () => {
      await apiClient.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data')
    })
  })

  describe('getCurrentUser', () => {
    it('debería retornar usuario cuando hay datos en localStorage', async () => {
      const userData = { id: '1', username: 'testuser' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(userData))

      const result = await apiClient.getCurrentUser()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('user_data')
      expect(result).toEqual(userData)
    })

    it('debería retornar null cuando no hay datos en localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = await apiClient.getCurrentUser()

      expect(result).toBeNull()
    })

    it('debería retornar null cuando los datos en localStorage son inválidos', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const result = await apiClient.getCurrentUser()

      expect(result).toBeNull()
    })
  })
})
