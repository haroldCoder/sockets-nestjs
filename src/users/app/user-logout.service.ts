import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainUserService } from '../domain/user.service';
import { ResponseClient } from 'src/shared/dto/responseClient';

@Injectable()
export class UserLogoutService {
  constructor(private readonly domainUserService: DomainUserService) {}

  async execute(username: string): Promise<ResponseClient> {
    try {
      const result: ResponseClient = await this.domainUserService.logout(username);
      return result;
    } catch (error) {
      console.error('Error during logout:', error);
      return new ResponseClient(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred", null);
    }
  }
}
