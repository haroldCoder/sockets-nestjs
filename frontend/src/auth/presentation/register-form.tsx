import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/authSlice';
import { RegisterUseCase } from '../application/register.use-case';
import { ApiClient } from '../infrastructure/api-client';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useDispatch();
  const registerUseCase = new RegisterUseCase(new ApiClient());

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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const result = await registerUseCase.execute({
        username: formData.username,
        password: formData.password,
        id: formData.id,
        ip: '127.0.0.1'
      });
      
      if (result.success) {
        dispatch(loginUser({
          user: {id: "user", username: formData.username},
          token: result.token || ''
        }));
        onSuccess?.();
      } else {
        setError(result.message || 'Error en el registro');
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Registrarse</h2>
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
          <label htmlFor="id">ID:</label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="ID único del usuario"
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      
      {onSwitchToLogin && (
        <p>
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToLogin} className="link-button">
            Inicia sesión aquí
          </button>
        </p>
      )}
    </div>
  );
};
