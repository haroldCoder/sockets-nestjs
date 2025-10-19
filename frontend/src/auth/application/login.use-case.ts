import { AuthRepository } from '../domain/auth.repository';
import { UserCredentials, AuthResult } from '../domain/user.entity';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(credentials: UserCredentials): Promise<AuthResult> {
    try {
      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          message: 'Username y password son requeridos'
        };
      }

      if (credentials.username.length < 3) {
        return {
          success: false,
          message: 'El username debe tener al menos 3 caracteres'
        };
      }

      if (credentials.password.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      return await this.authRepository.login(credentials);
    } catch (error) {
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}
