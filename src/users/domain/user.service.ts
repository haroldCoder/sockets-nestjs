import { Inject, Injectable } from '@nestjs/common';
import { Users } from 'src/interfaces/users';
import { UserRepository, USER_REPOSITORY } from './user.repository';

@Injectable()
export class DomainUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async loginOrRegister(user: Users): Promise<Users> {
    const existingUser = await this.userRepository.findByUsername(
      user.username,
    );

    if (existingUser) {
      return existingUser;
    }

    return this.userRepository.save(user);
  }
}

