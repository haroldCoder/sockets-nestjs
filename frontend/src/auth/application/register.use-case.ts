import { AuthRepository } from '../domain/auth.repository';
import { UserRegistration, AuthResult } from '../domain/user.entity';

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userData: UserRegistration): Promise<AuthResult> {
    try {
      if (!userData.username || !userData.password || !userData.id) {
        return {
          success: false,
          message: 'Todos los campos son requeridos'
        };
      }

      if (userData.username.length < 3) {
        return {
          success: false,
          message: 'El username debe tener al menos 3 caracteres'
        };
      }

      if (userData.password.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      if (!userData.id || userData.id.trim() === '') {
        return {
          success: false,
          message: 'El ID es requerido'
        };
      }

      return await this.authRepository.register(userData);
    } catch (error) {
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}
