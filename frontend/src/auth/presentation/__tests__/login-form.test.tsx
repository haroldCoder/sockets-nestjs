import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { LoginForm } from '../login-form'
import { LoginUseCase } from '../../application/login.use-case'
import { ApiClient } from '../../infrastructure/api-client'
import authReducer from '../../../redux/authSlice'

vi.mock('../../application/login.use-case')
vi.mock('../../infrastructure/api-client')

const mockLoginUseCase = vi.mocked(LoginUseCase)
const mockApiClient = vi.mocked(ApiClient)

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer
    }
  })
}

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore()
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store
  }
}

describe('LoginForm', () => {
  let mockExecute: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockExecute = vi.fn()
    mockLoginUseCase.mockImplementation(() => ({
      execute: mockExecute
    }) as any)
  })

  it('debería renderizar el formulario de login correctamente', () => {
    renderWithProvider(<LoginForm />)

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario:')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('debería actualizar los campos del formulario cuando el usuario escribe', async () => {
    const user = userEvent.setup()
    renderWithProvider(<LoginForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const passwordInput = screen.getByLabelText('Contraseña:')

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')

    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('password123')
  })

  it('debería mostrar error cuando las credenciales son inválidas', async () => {
    const user = userEvent.setup()
    mockExecute.mockResolvedValue({
      success: false,
      message: 'Credenciales inválidas'
    })

    renderWithProvider(<LoginForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })

  it('debería mostrar loading durante el proceso de login', async () => {
    const user = userEvent.setup()
    mockExecute.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProvider(<LoginForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('debería llamar onSuccess cuando el login es exitoso', async () => {
    const user = userEvent.setup()
    const onSuccessMock = vi.fn()
    
    mockExecute.mockResolvedValue({
      success: true,
      token: 'jwt-token'
    })

    renderWithProvider(<LoginForm onSuccess={onSuccessMock} />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled()
    })
  })

  it('debería mostrar el botón de cambio a registro cuando se proporciona onSwitchToRegister', () => {
    const onSwitchToRegisterMock = vi.fn()
    renderWithProvider(<LoginForm onSwitchToRegister={onSwitchToRegisterMock} />)

    expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regístrate aquí' })).toBeInTheDocument()
  })

  it('debería llamar onSwitchToRegister cuando se hace clic en el enlace de registro', async () => {
    const user = userEvent.setup()
    const onSwitchToRegisterMock = vi.fn()
    renderWithProvider(<LoginForm onSwitchToRegister={onSwitchToRegisterMock} />)

    const switchButton = screen.getByRole('button', { name: 'Regístrate aquí' })
    await user.click(switchButton)

    expect(onSwitchToRegisterMock).toHaveBeenCalled()
  })

  it('debería limpiar el error cuando el usuario modifica los campos', async () => {
    const user = userEvent.setup()
    mockExecute.mockResolvedValue({
      success: false,
      message: 'Error inicial'
    })

    renderWithProvider(<LoginForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error inicial')).toBeInTheDocument()
    })

    await user.clear(usernameInput)
    await user.type(usernameInput, 'newuser')

    expect(screen.queryByText('Error inicial')).not.toBeInTheDocument()
  })

  it('debería manejar errores inesperados', async () => {
    const user = userEvent.setup()
    mockExecute.mockRejectedValue(new Error('Error inesperado'))

    renderWithProvider(<LoginForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error inesperado')).toBeInTheDocument()
    })
  })
})
