export interface User {
  id: string;
  username: string;
  password?: string;
  ip?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistration {
  username: string;
  password: string;
  id: string;
  ip: string;
}

export interface AuthResult {
  success: boolean,
  message: string
  user?: {id: string, username: string},
  token?: string
}

