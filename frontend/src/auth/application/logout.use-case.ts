import { AuthRepository } from '../domain/auth.repository';

export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
