export interface AuthResult {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
  };
  token?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
