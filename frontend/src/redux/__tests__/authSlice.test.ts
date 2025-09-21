import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { 
  loginUser, 
  logoutUser, 
  setLoading, 
  setError, 
  clearError, 
  initializeAuth 
} from '../authSlice';
import { AuthState } from '../../auth/domain/auth.entity';

describe('authSlice', () => {
  let initialState: AuthState;

  beforeEach(() => {
    initialState = {
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    };
  });

  describe('logoutUser', () => {
    it('debería resetear el estado de autenticación a los valores iniciales', () => {
      const stateWithAuth: AuthState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'test-token',
        loading: false,
        error: 'Some error',
      };

      const newState = authReducer(stateWithAuth, logoutUser());

      expect(newState).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    });

    it('debería funcionar correctamente desde el estado inicial', () => {
      const newState = authReducer(initialState, logoutUser());

      expect(newState).toEqual(initialState);
    });

    it('debería limpiar cualquier error previo', () => {
      const stateWithError: AuthState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'test-token',
        loading: true,
        error: 'Previous error',
      };

      const newState = authReducer(stateWithError, logoutUser());

      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(false);
    });

    it('debería mantener la inmutabilidad del estado', () => {
      const stateWithAuth: AuthState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'test-token',
        loading: false,
        error: null,
      };

      const originalState = { ...stateWithAuth };
      authReducer(stateWithAuth, logoutUser());

      expect(stateWithAuth).toEqual(originalState);
    });
  });

  describe('loginUser', () => {
    it('debería establecer el estado de autenticación correctamente', () => {
      const userData = {
        user: { id: '1', username: 'testuser' },
        token: 'test-token',
      };

      const newState = authReducer(initialState, loginUser(userData));

      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user).toEqual(userData.user);
      expect(newState.token).toBe(userData.token);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('debería actualizar el estado de loading', () => {
      const newState = authReducer(initialState, setLoading(true));
      expect(newState.loading).toBe(true);

      const newState2 = authReducer(newState, setLoading(false));
      expect(newState2.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('debería establecer un error y desactivar loading', () => {
      const errorMessage = 'Test error';
      const stateWithLoading: AuthState = {
        ...initialState,
        loading: true,
      };

      const newState = authReducer(stateWithLoading, setError(errorMessage));

      expect(newState.error).toBe(errorMessage);
      expect(newState.loading).toBe(false);
    });

    it('debería permitir establecer error como null', () => {
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Previous error',
      };

      const newState = authReducer(stateWithError, setError(null));

      expect(newState.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('debería limpiar el error del estado', () => {
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Test error',
      };

      const newState = authReducer(stateWithError, clearError());

      expect(newState.error).toBeNull();
    });
  });

  describe('initializeAuth', () => {
    it('debería inicializar el estado con datos de usuario cuando se proporcionan', () => {
      const authData = {
        user: { id: '1', username: 'testuser' },
        token: 'test-token',
      };

      const newState = authReducer(initialState, initializeAuth(authData));

      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user).toEqual(authData.user);
      expect(newState.token).toBe(authData.token);
    });

    it('debería resetear el estado cuando se pasa null', () => {
      const stateWithAuth: AuthState = {
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
        token: 'test-token',
        loading: false,
        error: null,
      };

      const newState = authReducer(stateWithAuth, initializeAuth(null));

      expect(newState.isAuthenticated).toBe(false);
      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
    });
  });

  describe('estado inicial', () => {
    it('debería tener el estado inicial correcto', () => {
      expect(initialState).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    });
  });
});
