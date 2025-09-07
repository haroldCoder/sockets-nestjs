import { Injectable } from '@nestjs/common';
import { Users } from 'src/interfaces/users';
import { DomainUserService } from '../domain/user.service';

@Injectable()
export class UserLoginService {
  constructor(private readonly domainUserService: DomainUserService) {}

  async execute(data: Users): Promise<boolean> {
    try {
      const user = await this.domainUserService.loginOrRegister(data);
      return !!user;
    } catch (error) {
      console.error('Error during login/registration:', error);
      return false;
    }
  }
}
