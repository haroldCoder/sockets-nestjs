import { describe, it, expect } from 'vitest'
import { User, UserCredentials, UserRegistration, AuthResult } from '../user.entity'
import { AuthState } from '../auth.entity'

describe('Domain Entities', () => {
  describe('User', () => {
    it('debería crear un usuario con todos los campos', () => {
      const user: User = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      expect(user.id).toBe('1')
      expect(user.username).toBe('testuser')
      expect(user.password).toBe('password123')
      expect(user.ip).toBe('192.168.1.1')
    })

    it('debería crear un usuario sin campos opcionales', () => {
      const user: User = {
        id: '1',
        username: 'testuser'
      }

      expect(user.id).toBe('1')
      expect(user.username).toBe('testuser')
      expect(user.password).toBeUndefined()
      expect(user.ip).toBeUndefined()
    })
  })

  describe('UserCredentials', () => {
    it('debería crear credenciales de usuario válidas', () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      expect(credentials.username).toBe('testuser')
      expect(credentials.password).toBe('password123')
    })

    it('debería permitir credenciales con caracteres especiales', () => {
      const credentials: UserCredentials = {
        username: 'user@domain.com',
        password: 'p@ssw0rd!'
      }

      expect(credentials.username).toBe('user@domain.com')
      expect(credentials.password).toBe('p@ssw0rd!')
    })
  })

  describe('UserRegistration', () => {
    it('debería crear datos de registro válidos', () => {
      const registration: UserRegistration = {
        id: '1',
        username: 'newuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      expect(registration.id).toBe('1')
      expect(registration.username).toBe('newuser')
      expect(registration.password).toBe('password123')
      expect(registration.ip).toBe('192.168.1.1')
    })

    it('debería permitir diferentes formatos de IP', () => {
      const registration: UserRegistration = {
        id: '1',
        username: 'newuser',
        password: 'password123',
        ip: '127.0.0.1'
      }

      expect(registration.ip).toBe('127.0.0.1')
    })
  })

  describe('AuthResult', () => {
    it('debería crear un resultado de autenticación exitoso', () => {
      const result: AuthResult = {
        success: true,
        message: 'Login exitoso',
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      expect(result.success).toBe(true)
      expect(result.message).toBe('Login exitoso')
      expect(result.user).toEqual({ id: '1', username: 'testuser' })
      expect(result.token).toBe('jwt-token')
    })

    it('debería crear un resultado de autenticación fallido', () => {
      const result: AuthResult = {
        success: false,
        message: 'Credenciales inválidas'
      }

      expect(result.success).toBe(false)
      expect(result.message).toBe('Credenciales inválidas')
      expect(result.user).toBeUndefined()
      expect(result.token).toBeUndefined()
    })

    it('debería permitir resultado exitoso sin token', () => {
      const result: AuthResult = {
        success: true,
        message: 'Operación exitosa',
        user: { id: '1', username: 'testuser' }
      }

      expect(result.success).toBe(true)
      expect(result.user).toEqual({ id: '1', username: 'testuser' })
      expect(result.token).toBeUndefined()
    })

    it('debería permitir resultado exitoso sin usuario', () => {
      const result: AuthResult = {
        success: true,
        message: 'Operación exitosa',
        token: 'jwt-token'
      }

      expect(result.success).toBe(true)
      expect(result.token).toBe('jwt-token')
      expect(result.user).toBeUndefined()
    })
  })

  describe('AuthState', () => {
    it('debería crear un estado de autenticación inicial', () => {
      const state: AuthState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      }

      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('debería crear un estado de autenticación exitoso', () => {
      const state: AuthState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token',
        loading: false,
        error: null
      }

      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual({ id: '1', username: 'testuser' })
      expect(state.token).toBe('jwt-token')
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('debería crear un estado de autenticación con error', () => {
      const state: AuthState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: 'Error de conexión'
      }

      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Error de conexión')
    })

    it('debería crear un estado de autenticación en loading', () => {
      const state: AuthState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: true,
        error: null
      }

      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('debería permitir estado autenticado con loading', () => {
      const state: AuthState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token',
        loading: true,
        error: null
      }

      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual({ id: '1', username: 'testuser' })
      expect(state.token).toBe('jwt-token')
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })
  })

  describe('Type Safety', () => {
    it('debería mantener la consistencia de tipos entre entidades', () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        password: 'password123'
      }

      const user: User = {
        id: '1',
        username: credentials.username,
        password: credentials.password
      }

      expect(user.username).toBe(credentials.username)
      expect(user.password).toBe(credentials.password)
    })

    it('debería mantener la consistencia entre UserRegistration y User', () => {
      const registration: UserRegistration = {
        id: '1',
        username: 'newuser',
        password: 'password123',
        ip: '192.168.1.1'
      }

      const user: User = {
        id: registration.id,
        username: registration.username,
        password: registration.password,
        ip: registration.ip
      }

      expect(user.id).toBe(registration.id)
      expect(user.username).toBe(registration.username)
      expect(user.password).toBe(registration.password)
      expect(user.ip).toBe(registration.ip)
    })

    it('debería mantener la consistencia entre AuthResult y AuthState', () => {
      const authResult: AuthResult = {
        success: true,
        message: 'Login exitoso',
        user: { id: '1', username: 'testuser' },
        token: 'jwt-token'
      }

      const authState: AuthState = {
        isAuthenticated: authResult.success,
        user: authResult.user || null,
        token: authResult.token || null,
        loading: false,
        error: null
      }

      expect(authState.isAuthenticated).toBe(authResult.success)
      expect(authState.user).toEqual(authResult.user)
      expect(authState.token).toBe(authResult.token)
    })
  })
})

