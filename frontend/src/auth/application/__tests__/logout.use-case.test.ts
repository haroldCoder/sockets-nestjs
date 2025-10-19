import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogoutUseCase } from '../logout.use-case'
import { AuthRepository } from '../../domain/auth.repository'

// Mock del repositorio
const mockAuthRepository: AuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn()
}

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    logoutUseCase = new LogoutUseCase(mockAuthRepository)
  })

  describe('execute', () => {
    it('debería llamar al método logout del repositorio', async () => {
      vi.mocked(mockAuthRepository.logout).mockResolvedValue()

      await logoutUseCase.execute()

      expect(mockAuthRepository.logout).toHaveBeenCalledTimes(1)
    })

    it('debería manejar errores del repositorio sin lanzar excepción', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(mockAuthRepository.logout).mockRejectedValue(new Error('Network error'))

      await expect(logoutUseCase.execute()).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith('Error al cerrar sesión:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('debería completar exitosamente cuando el repositorio funciona correctamente', async () => {
      vi.mocked(mockAuthRepository.logout).mockResolvedValue()

      await expect(logoutUseCase.execute()).resolves.toBeUndefined()
    })

    it('debería no mostrar error en consola cuando el logout es exitoso', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(mockAuthRepository.logout).mockResolvedValue()

      await logoutUseCase.execute()

      expect(consoleSpy).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })
})

