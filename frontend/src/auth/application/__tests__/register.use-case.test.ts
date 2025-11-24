import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterUseCase } from '../register.use-case'
import { AuthRepository } from '../../domain/auth.repository'
import { UserRegistration, AuthResult } from '../../domain/user.entity'

const mockAuthRepository: AuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn()
}

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    registerUseCase = new RegisterUseCase(mockAuthRepository)
  })

  describe('execute', () => {
    it('debería retornar error cuando username está vacío', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: '',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual({
        success: false,
        message: 'Todos los campos son requeridos'
      })
      expect(mockAuthRepository.register).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando password está vacío', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'testuser',
        password: '',
        ip: '192.168.1.1'
      }

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual({
        success: false,
        message: 'Todos los campos son requeridos'
      })
      expect(mockAuthRepository.register).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando id está vacío', async () => {
      const userData: UserRegistration = {
        id: '',
        username: 'testuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual({
        success: false,
        message: 'Todos los campos son requeridos'
      })
      expect(mockAuthRepository.register).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando username tiene menos de 3 caracteres', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'ab',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual({
        success: false,
        message: 'El username debe tener al menos 3 caracteres'
      })
      expect(mockAuthRepository.register).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando password tiene menos de 6 caracteres', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'testuser',
        password: '12345',
        ip: '192.168.1.1'
      }

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      })
      expect(mockAuthRepository.register).not.toHaveBeenCalled()
    })

    it('debería retornar error cuando id está vacío o solo espacios', async () => {
      const userData: UserRegistration = {
        id: '   ',
        username: 'testuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual({
        success: false,
        message: 'El ID es requerido'
      })
      expect(mockAuthRepository.register).not.toHaveBeenCalled()
    })

    it('debería llamar al repositorio cuando los datos son válidos', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const expectedResult: AuthResult = {
        success: true,
        message: 'Registro exitoso',
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      vi.mocked(mockAuthRepository.register).mockResolvedValue(expectedResult)

      const result = await registerUseCase.execute(userData)

      expect(mockAuthRepository.register).toHaveBeenCalledWith(userData)
      expect(result).toEqual(expectedResult)
    })

    it('debería manejar errores del repositorio', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      vi.mocked(mockAuthRepository.register).mockRejectedValue(new Error('Network error'))

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual({
        success: false,
        message: 'Error interno del servidor'
      })
    })

    it('debería retornar el resultado del repositorio cuando es exitoso', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const repositoryResult: AuthResult = {
        success: true,
        message: 'Registro exitoso',
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      vi.mocked(mockAuthRepository.register).mockResolvedValue(repositoryResult)

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual(repositoryResult)
    })

    it('debería retornar el resultado del repositorio cuando falla', async () => {
      const userData: UserRegistration = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const repositoryResult: AuthResult = {
        success: false,
        message: 'El usuario ya existe'
      }

      vi.mocked(mockAuthRepository.register).mockResolvedValue(repositoryResult)

      const result = await registerUseCase.execute(userData)

      expect(result).toEqual(repositoryResult)
    })
  })
})

