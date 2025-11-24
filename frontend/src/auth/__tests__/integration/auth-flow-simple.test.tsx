import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { AuthContainer } from '../../presentation/auth-container'
import { ApiClient } from '../../infrastructure/api-client'
import authReducer from '../../../redux/authSlice'

vi.mock('../../infrastructure/api-client')
const mockApiClient = vi.mocked(ApiClient)

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

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
      
      mockLogin.mockResolvedValue({
        success: true,
        message: 'Login exitoso',
        token: 'jwt-token'
      })

      const { store } = renderWithProvider(<AuthContainer />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      const usernameInput = screen.getByLabelText('Usuario:')
      const passwordInput = screen.getByLabelText('Contraseña:')
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
      })

      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(true)
      expect(state.auth.user).toEqual({ id: 'user', username: 'testuser' })
      expect(state.auth.token).toBe('jwt-token')
    })

    it('debería manejar el login fallido', async () => {
      const user = userEvent.setup()
      
      mockLogin.mockResolvedValue({
        success: false,
        message: 'Credenciales inválidas'
      })

      renderWithProvider(<AuthContainer />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      const usernameInput = screen.getByLabelText('Usuario:')
      const passwordInput = screen.getByLabelText('Contraseña:')
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    })
  })

  describe('Register Flow', () => {
    it('debería completar el flujo de registro exitosamente', async () => {
      const user = userEvent.setup()
      
      mockRegister.mockResolvedValue({
        success: true,
        message: 'Registro exitoso',
        token: 'jwt-token',
        user: { id: '1', username: 'newuser' }
      })

      const { store } = renderWithProvider(<AuthContainer />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      const switchToRegisterButton = screen.getByRole('button', { name: 'Regístrate aquí' })
      await user.click(switchToRegisterButton)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument()
      })

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

      expect(screen.getByText('Registrando...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
      })

      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(true)
      expect(state.auth.user).toEqual({ id: '1', username: 'newuser' })
      expect(state.auth.token).toBe('jwt-token')
    })
  })

  describe('Logout Flow', () => {
    it('debería completar el flujo de logout correctamente', async () => {
      const user = userEvent.setup()
      
      const initialState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      const { store } = renderWithProvider(<AuthContainer />, initialState)

      expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()

      const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' })
      await user.click(logoutButton)

      expect(mockLogout).toHaveBeenCalled()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(false)
      expect(state.auth.user).toBeNull()
      expect(state.auth.token).toBeNull()

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

      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
      })

      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(true)
      expect(state.auth.user).toEqual(mockUser)
      expect(state.auth.token).toBe(mockToken)
    })

    it('debería inicializar como no autenticado cuando no hay datos', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      mockGetCurrentUser.mockResolvedValue(null)

      const { store } = renderWithProvider(<AuthContainer />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      })

      const state = store.getState()
      expect(state.auth.isAuthenticated).toBe(false)
      expect(state.auth.user).toBeNull()
      expect(state.auth.token).toBeNull()
    })
  })
})

