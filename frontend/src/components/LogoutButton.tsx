import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { ApiClient } from '../auth/infrastructure/api-client';

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const apiClient = new ApiClient();
      await apiClient.logout();
      dispatch(logoutUser());
    } catch (error) {
      console.error('Error during logout:', error);
      dispatch(logoutUser());
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className={`logout-button ${className}`}
      title="Cerrar Sesión"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="logout-icon"
      >
        <path 
          d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};
