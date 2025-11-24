import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { RegisterForm } from '../register-form'
import { RegisterUseCase } from '../../application/register.use-case'
import { ApiClient } from '../../infrastructure/api-client'
import authReducer from '../../../redux/authSlice'

vi.mock('../../application/register.use-case')
vi.mock('../../infrastructure/api-client')

const mockRegisterUseCase = vi.mocked(RegisterUseCase)
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

describe('RegisterForm', () => {
  let mockExecute: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockExecute = vi.fn()
    mockRegisterUseCase.mockImplementation(() => ({
      execute: mockExecute
    }) as any)
  })

  it('debería renderizar el formulario de registro correctamente', () => {
    renderWithProvider(<RegisterForm />)

    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario:')).toBeInTheDocument()
    expect(screen.getByLabelText('ID:')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña:')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar Contraseña:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument()
  })

  it('debería actualizar los campos del formulario cuando el usuario escribe', async () => {
    const user = userEvent.setup()
    renderWithProvider(<RegisterForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const idInput = screen.getByLabelText('ID:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña:')

    await user.type(usernameInput, 'newuser')
    await user.type(idInput, '123')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    expect(usernameInput).toHaveValue('newuser')
    expect(idInput).toHaveValue('123')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('debería mostrar error cuando las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    renderWithProvider(<RegisterForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const idInput = screen.getByLabelText('ID:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Registrarse' })

    await user.type(usernameInput, 'newuser')
    await user.type(idInput, '123')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })

    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('debería mostrar error cuando el registro falla', async () => {
    const user = userEvent.setup()
    mockExecute.mockResolvedValue({
      success: false,
      message: 'El usuario ya existe'
    })

    renderWithProvider(<RegisterForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const idInput = screen.getByLabelText('ID:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Registrarse' })

    await user.type(usernameInput, 'existinguser')
    await user.type(idInput, '123')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El usuario ya existe')).toBeInTheDocument()
    })
  })

  it('debería mostrar loading durante el proceso de registro', async () => {
    const user = userEvent.setup()
    mockExecute.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProvider(<RegisterForm />)

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
    expect(submitButton).toBeDisabled()
  })

  it('debería llamar onSuccess cuando el registro es exitoso', async () => {
    const user = userEvent.setup()
    const onSuccessMock = vi.fn()
    
    mockExecute.mockResolvedValue({
      success: true,
      user: { id: '123', username: 'newuser' },
      token: 'jwt-token'
    })

    renderWithProvider(<RegisterForm onSuccess={onSuccessMock} />)

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

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled()
    })
  })

  it('debería mostrar el botón de cambio a login cuando se proporciona onSwitchToLogin', () => {
    const onSwitchToLoginMock = vi.fn()
    renderWithProvider(<RegisterForm onSwitchToLogin={onSwitchToLoginMock} />)

    expect(screen.getByText('¿Ya tienes cuenta?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inicia sesión aquí' })).toBeInTheDocument()
  })

  it('debería llamar onSwitchToLogin cuando se hace clic en el enlace de login', async () => {
    const user = userEvent.setup()
    const onSwitchToLoginMock = vi.fn()
    renderWithProvider(<RegisterForm onSwitchToLogin={onSwitchToLoginMock} />)

    const switchButton = screen.getByRole('button', { name: 'Inicia sesión aquí' })
    await user.click(switchButton)

    expect(onSwitchToLoginMock).toHaveBeenCalled()
  })

  it('debería limpiar el error cuando el usuario modifica los campos', async () => {
    const user = userEvent.setup()
    mockExecute.mockResolvedValue({
      success: false,
      message: 'Error inicial'
    })

    renderWithProvider(<RegisterForm />)

    const usernameInput = screen.getByLabelText('Usuario:')
    const idInput = screen.getByLabelText('ID:')
    const passwordInput = screen.getByLabelText('Contraseña:')
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña:')
    const submitButton = screen.getByRole('button', { name: 'Registrarse' })

    await user.type(usernameInput, 'testuser')
    await user.type(idInput, '123')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
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

    renderWithProvider(<RegisterForm />)

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

    await waitFor(() => {
      expect(screen.getByText('Error inesperado')).toBeInTheDocument()
    })
  })

  it('debería pasar los datos correctos al caso de uso', async () => {
    const user = userEvent.setup()
    mockExecute.mockResolvedValue({
      success: true,
      user: { id: '123', username: 'newuser' },
      token: 'jwt-token'
    })

    renderWithProvider(<RegisterForm />)

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

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'password123',
        id: '123',
        ip: '127.0.0.1'
      })
    })
  })
})
