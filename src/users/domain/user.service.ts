import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository, USER_REPOSITORY } from './user.repository';
import { ResponseClient } from 'src/shared/dto/responseClient';
import { userLogin } from './user-login.entity';

@Injectable()
export class DomainUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async login(user: userLogin): Promise<ResponseClient> {
    const existingUser = await this.userRepository.LoginUser({
      username: user.username,
      password: user.password
    });

    if (existingUser) {
      return new ResponseClient(HttpStatus.OK, "user logged", existingUser);
    }

    return new ResponseClient(HttpStatus.NOT_FOUND, "User not found", null);
  }

  async register(user: User): Promise<ResponseClient> {
    const result = await this.userRepository.RegisterUser(user);

    if (result) {
      return new ResponseClient(HttpStatus.OK, "user registered", null);
    }

    return new ResponseClient(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred", null);
  }

  async logout(username: string): Promise<ResponseClient> {
    const result = await this.userRepository.LogoutUser(username);

    if (result) {
      return new ResponseClient(HttpStatus.OK, "user logged out", null);
    }

    return new ResponseClient(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred during logout", null);
  }
}

