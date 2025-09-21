import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LogoutButton } from '../LogoutButton';
import { ApiClient } from '../../auth/infrastructure/api-client';
import authReducer from '../../redux/authSlice';

jest.mock('../../auth/infrastructure/api-client');
const MockedApiClient = ApiClient as jest.MockedClass<typeof ApiClient>;

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('LogoutButton', () => {
  let mockStore: any;
  let mockLogout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    
    mockLogout = jest.fn();
    MockedApiClient.prototype.logout = mockLogout;

    mockStore = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: '1', username: 'testuser' },
          token: 'test-token',
          loading: false,
          error: null,
        },
      },
    });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  it('debería renderizar el botón de logout correctamente', () => {
    renderWithProvider(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /cerrar sesión/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('logout-button');
  });

  it('debería aplicar la className personalizada cuando se proporciona', () => {
    renderWithProvider(<LogoutButton className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('logout-button', 'custom-class');
  });

  it('debería mostrar el ícono SVG correctamente', () => {
    renderWithProvider(<LogoutButton />);
    
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('logout-icon');
  });

  it('debería llamar a logout y dispatch logoutUser cuando se hace clic exitosamente', async () => {
    mockLogout.mockResolvedValue(undefined);
    
    renderWithProvider(<LogoutButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    const state = mockStore.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(state.auth.token).toBeNull();
  });

  it('debería manejar errores de logout y aún así dispatch logoutUser', async () => {
    const error = new Error('Error de red');
    mockLogout.mockRejectedValue(error);
    
    renderWithProvider(<LogoutButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error during logout:', error);
    });

    const state = mockStore.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(state.auth.token).toBeNull();
  });

  it('debería crear una nueva instancia de ApiClient en cada llamada', async () => {
    mockLogout.mockResolvedValue(undefined);
    
    renderWithProvider(<LogoutButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(MockedApiClient).toHaveBeenCalledTimes(1);
    });
  });

  it('debería tener el atributo title correcto', () => {
    renderWithProvider(<LogoutButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Cerrar Sesión');
  });
});
