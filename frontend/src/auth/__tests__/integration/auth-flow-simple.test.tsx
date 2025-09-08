import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { AuthContainer } from '../../presentation/auth-container'
import { ApiClient } from '../../infrastructure/api-client'
import authReducer from '../../../redux/authSlice'

// Mock del ApiClient
vi.mock('../../infrastructure/api-client')
const mockApiClient = vi.mocked(ApiClient)

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Crear store de prueba
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState
      }
    }
  })
}

// Wrapper para proveer el store
const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState)
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store
  }
}

describe('Auth Flow Integration Tests (Simplified)', () => {
  let mockLogin: any
  let mockRegister: any
  let mockLogout: any
  let mockGetCurrentUser: any

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Mock de los métodos del ApiClient
    mockLogin = vi.fn()
    mockRegister = vi.fn()
    mockLogout = vi.fn()
    mockGetCurrentUser = vi.fn()
    
    mockApiClient.mockImplementation(() => ({
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
      getCurrentUser: mockGetCurrentUser
    }) as any)
  })

  describe('Login Flow', () => {
    it('debería completar el flujo de login exitosamente', async () => {
      const user = userEvent.setup()
      
      // Configurar mock para login exitoso
      mockLogin.mockResolvedValue({
        success: true,
        message: 'Login exitoso',
        token: 'jwt-token'
      })

      const { store } = renderWithProvider(<AuthContainer />)

      // Esperar a que se cargue el formulario
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      // Llenar el formulario de login
      const usernameInput = screen.getByLabelText('Usuario:')
      const passwordInput = screen.getByLabelText('Contraseña:')
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Esperar a que se complete el login
      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
      })

      // Verificar que el estado se actualizó correctamente
      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(true)
      expect(state.auth.user).toEqual({ id: 'user', username: 'testuser' })
      expect(state.auth.token).toBe('jwt-token')
    })

    it('debería manejar el login fallido', async () => {
      const user = userEvent.setup()
      
      // Configurar mock para login fallido
      mockLogin.mockResolvedValue({
        success: false,
        message: 'Credenciales inválidas'
      })

      renderWithProvider(<AuthContainer />)

      // Esperar a que se cargue el formulario
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      // Llenar el formulario con credenciales incorrectas
      const usernameInput = screen.getByLabelText('Usuario:')
      const passwordInput = screen.getByLabelText('Contraseña:')
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // Verificar que se muestra el error
      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
      })

      // Verificar que el formulario sigue visible
      expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    })
  })

  describe('Register Flow', () => {
    it('debería completar el flujo de registro exitosamente', async () => {
      const user = userEvent.setup()
      
      // Configurar mock para registro exitoso
      mockRegister.mockResolvedValue({
        success: true,
        message: 'Registro exitoso',
        token: 'jwt-token',
        user: { id: '1', username: 'newuser' }
      })

      const { store } = renderWithProvider(<AuthContainer />)

      // Esperar a que se cargue el formulario de login
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      // Cambiar al formulario de registro
      const switchToRegisterButton = screen.getByRole('button', { name: 'Regístrate aquí' })
      await user.click(switchToRegisterButton)

      // Verificar que se muestra el formulario de registro
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument()
      })

      // Llenar el formulario de registro
      const usernameInput = screen.getByLabelText('Usuario:')
      const idInput = screen.getByLabelText('ID:')
      const passwordInput = screen.getByLabelText('Contraseña:')
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña:')
      const submitButton = screen.getByRole('button', { name: 'Registrarse' })

      await user.type(usernameInput, 'newuser')
      await user.type(idInput, '123')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Verificar que se muestra el loading
      expect(screen.getByText('Registrando...')).toBeInTheDocument()

      // Esperar a que se complete el registro
      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
      })

      // Verificar que el estado se actualizó correctamente
      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(true)
      expect(state.auth.user).toEqual({ id: '1', username: 'newuser' })
      expect(state.auth.token).toBe('jwt-token')
    })
  })

  describe('Logout Flow', () => {
    it('debería completar el flujo de logout correctamente', async () => {
      const user = userEvent.setup()
      
      // Estado inicial autenticado
      const initialState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      const { store } = renderWithProvider(<AuthContainer />, initialState)

      // Verificar que se muestra la interfaz de usuario autenticado
      expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()

      // Hacer logout
      const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' })
      await user.click(logoutButton)

      // Verificar que se llama al método logout
      expect(mockLogout).toHaveBeenCalled()

      // Verificar que se muestra el formulario de login
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      // Verificar que el estado se actualizó correctamente
      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(false)
      expect(state.auth.user).toBeNull()
      expect(state.auth.token).toBeNull()

      // Verificar que se limpió el localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data')
    })
  })

  describe('Auth Initialization', () => {
    it('debería inicializar la autenticación con datos existentes', async () => {
      const mockUser = { id: '1', username: 'testuser' }
      const mockToken = 'jwt-token'
      
      localStorageMock.getItem.mockReturnValue(mockToken)
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const { store } = renderWithProvider(<AuthContainer />)

      // Esperar a que se inicialice la autenticación
      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
      })

      // Verificar que el estado se inicializó correctamente
      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(true)
      expect(state.auth.user).toEqual(mockUser)
      expect(state.auth.token).toBe(mockToken)
    })

    it('debería inicializar como no autenticado cuando no hay datos', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      mockGetCurrentUser.mockResolvedValue(null)

      const { store } = renderWithProvider(<AuthContainer />)

      // Esperar a que se cargue el formulario de login
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      // Verificar que el estado se inicializó como no autenticado
      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(false)
      expect(state.auth.user).toBeNull()
      expect(state.auth.token).toBeNull()
    })
  })
})

