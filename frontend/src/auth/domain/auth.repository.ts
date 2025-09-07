import { UserCredentials, UserRegistration, AuthResult } from './user.entity';

export interface AuthRepository {
  login(credentials: UserCredentials): Promise<AuthResult>;
  register(userData: UserRegistration): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<{ id: string; username: string } | null>;
}
