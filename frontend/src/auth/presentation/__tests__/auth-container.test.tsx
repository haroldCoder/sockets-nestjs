import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { AuthContainer } from '../auth-container'
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

describe('AuthContainer', () => {
  let mockGetCurrentUser: any
  let mockLogout: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock de los métodos del ApiClient
    mockGetCurrentUser = vi.fn()
    mockLogout = vi.fn()
    
    mockApiClient.mockImplementation(() => ({
      getCurrentUser: mockGetCurrentUser,
      logout: mockLogout
    }) as any)
  })

  it('debería mostrar el formulario de login por defecto cuando no está autenticado', () => {
    renderWithProvider(<AuthContainer />)

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('debería inicializar la autenticación al cargar', async () => {
    const mockUser = { id: '1', username: 'testuser' }
    const mockToken = 'jwt-token'
    
    mockGetCurrentUser.mockResolvedValue(mockUser)
    localStorageMock.getItem.mockReturnValue(mockToken)

    renderWithProvider(<AuthContainer />)

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled()
    })
  })

  it('debería mostrar la interfaz de usuario autenticado cuando hay token y usuario', async () => {
    const mockUser = { id: '1', username: 'testuser' }
    const mockToken = 'jwt-token'
    
    mockGetCurrentUser.mockResolvedValue(mockUser)
    localStorageMock.getItem.mockReturnValue(mockToken)

    const { store } = renderWithProvider(<AuthContainer />)

    // Simular que la autenticación se inicializó correctamente
    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled()
    })

    // Verificar que el estado se actualizó correctamente
    const state = store.getState()
    expect(state.auth.isAuthenticated).toBe(true)
    expect(state.auth.user).toEqual(mockUser)
    expect(state.auth.token).toBe(mockToken)
  })

  it('debería mostrar el formulario de login cuando no hay usuario autenticado', async () => {
    mockGetCurrentUser.mockResolvedValue(null)
    localStorageMock.getItem.mockReturnValue(null)

    renderWithProvider(<AuthContainer />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    })
  })

  it('debería cambiar entre formularios de login y registro', async () => {
    const user = userEvent.setup()
    renderWithProvider(<AuthContainer />)

    // Inicialmente debería mostrar el formulario de login
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()

    // Hacer clic en el enlace para cambiar a registro
    const switchToRegisterButton = screen.getByRole('button', { name: 'Regístrate aquí' })
    await user.click(switchToRegisterButton)

    // Debería mostrar el formulario de registro
    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument()

    // Hacer clic en el enlace para volver a login
    const switchToLoginButton = screen.getByRole('button', { name: 'Inicia sesión aquí' })
    await user.click(switchToLoginButton)

    // Debería mostrar el formulario de login nuevamente
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('debería mostrar la interfaz de usuario autenticado cuando isAuthenticated es true', () => {
    const initialState = {
      isAuthenticated: true,
      user: { id: '1', username: 'testuser' },
      token: 'jwt-token'
    }

    renderWithProvider(<AuthContainer />, initialState)

    expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
    expect(screen.getByText('Usuario autenticado correctamente')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar Sesión' })).toBeInTheDocument()
  })

  it('debería manejar el logout correctamente', async () => {
    const user = userEvent.setup()
    const initialState = {
      isAuthenticated: true,
      user: { id: '1', username: 'testuser' },
      token: 'jwt-token'
    }

    const { store } = renderWithProvider(<AuthContainer />, initialState)

    // Verificar que se muestra la interfaz de usuario autenticado
    expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument()
    
    const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' })
    await user.click(logoutButton)

    // Verificar que el estado se actualizó
    const state = store.getState()
    expect(state.auth.isAuthenticated).toBe(false)
    expect(state.auth.user).toBeNull()
    expect(state.auth.token).toBeNull()
  })

  it('debería manejar errores en la inicialización de autenticación', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetCurrentUser.mockRejectedValue(new Error('Error de red'))
    localStorageMock.getItem.mockReturnValue(null)

    renderWithProvider(<AuthContainer />)

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled()
    })

    // Debería mostrar el formulario de login como fallback
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('debería manejar el caso cuando hay token pero no usuario', async () => {
    mockGetCurrentUser.mockResolvedValue(null)
    localStorageMock.getItem.mockReturnValue('jwt-token')

    const { store } = renderWithProvider(<AuthContainer />)

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled()
    })

    // Debería inicializar como no autenticado
    const state = store.getState()
    expect(state.auth.isAuthenticated).toBe(false)
  })

  it('debería manejar el caso cuando hay usuario pero no token', async () => {
    const mockUser = { id: '1', username: 'testuser' }
    
    mockGetCurrentUser.mockResolvedValue(mockUser)
    localStorageMock.getItem.mockReturnValue(null)

    const { store } = renderWithProvider(<AuthContainer />)

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled()
    })

    // Debería inicializar como no autenticado
    const state = store.getState()
    expect(state.auth.isAuthenticated).toBe(false)
  })
})
