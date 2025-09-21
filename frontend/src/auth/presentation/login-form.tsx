import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/authSlice';
import { LoginUseCase } from '../application/login.use-case';
import { ApiClient } from '../infrastructure/api-client';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useDispatch();
  const loginUseCase = new LoginUseCase(new ApiClient());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginUseCase.execute(formData);
      
      if (result.success) {
        const userData = localStorage.getItem('user_data');
        const token = localStorage.getItem('auth_token');
        
        if (userData && token) {
          try {
            const user = JSON.parse(userData);
            dispatch(loginUser({
              user: user,
              token: token
            }));
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            dispatch(loginUser({
              user: {id: "user", username: formData.username},
              token: result.token || ''
            }));
          }
        } else {
          dispatch(loginUser({
            user: {id: "user", username: formData.username},
            token: result.token || ''
          }));
        }
        onSuccess?.();
      } else {
        setError(result.message || 'Error en el login');
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      
      {onSwitchToRegister && (
        <p>
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToRegister} className="link-button">
            Regístrate aquí
          </button>
        </p>
      )}
    </div>
  );
};
