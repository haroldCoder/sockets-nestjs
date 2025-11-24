import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginUseCase } from '../login.use-case'
import { AuthRepository } from '../../domain/auth.repository'
import { UserCredentials, AuthResult } from '../../domain/user.entity'

const mockAuthRepository: AuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn()
}

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    loginUseCase = new LoginUseCase(mockAuthRepository)
  })

  describe('execute', () => {
    it('debería retornar error cuando username está vacío', async () => {
      const credentials: UserCredentials = {
        username: '',
        password: 'password123'
      }

      const result = await loginUseCase.execute(credentials)

      expect(result).toEqual({
        success: false,
        message: 'Username y password son requeridos'
      })
      expect(mockAuthRepository.login).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando password está vacío', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: ''
      }

      const result = await loginUseCase.execute(credentials)

      expect(result).toEqual({
        success: false,
        message: 'Username y password son requeridos'
      })
      expect(mockAuthRepository.login).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando username tiene menos de 3 caracteres', async () => {
      const credentials: UserCredentials = {
        username: 'ab',
        password: 'password123'
      }

      const result = await loginUseCase.execute(credentials)

      expect(result).toEqual({
        success: false,
        message: 'El username debe tener al menos 3 caracteres'
      })
      expect(mockAuthRepository.login).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando password tiene menos de 6 caracteres', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: '12345'
      }

      const result = await loginUseCase.execute(credentials)

      expect(result).toEqual({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      })
      expect(mockAuthRepository.login).not.toHaveBeenCalled()
    })

    it('debería llamar al repositorio cuando las credenciales son válidas', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      const expectedResult: AuthResult = {
        success: true,
        message: 'Login exitoso',
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      vi.mocked(mockAuthRepository.login).mockResolvedValue(expectedResult)

      const result = await loginUseCase.execute(credentials)

      expect(mockAuthRepository.login).toHaveBeenCalledWith(credentials)
      expect(result).toEqual(expectedResult)
    })

    it('debería manejar errores del repositorio', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      vi.mocked(mockAuthRepository.login).mockRejectedValue(new Error('Network error'))

      const result = await loginUseCase.execute(credentials)

      expect(result).toEqual({
        success: false,
        message: 'Error interno del servidor'
      })
    })

    it('debería retornar el resultado del repositorio cuando es exitoso', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      const repositoryResult: AuthResult = {
        success: true,
        message: 'Login exitoso',
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      vi.mocked(mockAuthRepository.login).mockResolvedValue(repositoryResult)

      const result = await loginUseCase.execute(credentials)

      expect(result).toEqual(repositoryResult)
    })

    it('debería retornar el resultado del repositorio cuando falla', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      const repositoryResult: AuthResult = {
        success: false,
        message: 'Credenciales inválidas'
      }

      vi.mocked(mockAuthRepository.login).mockResolvedValue(repositoryResult)

      const result = await loginUseCase.execute(credentials)

      expect(result).toEqual(repositoryResult)
    })
  })
})

