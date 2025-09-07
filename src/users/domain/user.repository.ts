import { Users } from 'src/interfaces/users';

export interface UserRepository {
  findByUsername(username: string): Promise<Users | null>;
  save(user: Users): Promise<Users>;
}

export const USER_REPOSITORY = 'UserRepository';

