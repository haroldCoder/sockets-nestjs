import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { DomainUserService } from '../domain/user.service';
import { ResponseClient } from 'src/shared/dto/responseClient';
import { userLogin } from '../domain/user-login.entity';

@Injectable()
export class UserLoginService {
  constructor(private readonly domainUserService: DomainUserService) {}

  async execute(data: userLogin): Promise<ResponseClient> {
    try {
      const user: ResponseClient = await this.domainUserService.login(data);
      return user;
    } catch (error) {
      console.error('Error during login/registration:', error);
      return new ResponseClient(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred", null);
    }
  }
}
