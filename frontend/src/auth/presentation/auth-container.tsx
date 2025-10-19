import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { initializeAuth, logoutUser } from '../../redux/authSlice';
import { ApiClient } from '../infrastructure/api-client';

export const AuthContainer: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const initializeAuthState = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch(initializeAuth({ user, token }));
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          dispatch(initializeAuth(null));
        }
      } else {
        dispatch(initializeAuth(null));
      }
    };

    initializeAuthState();
  }, [dispatch]);

  const handleLogout = async () => {
    const apiClient = new ApiClient();
    await apiClient.logout();
    dispatch(logoutUser());
  };

  if (isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="user-info">
          <h3>¡Bienvenido!</h3>
          <p>Usuario autenticado correctamente</p>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};
