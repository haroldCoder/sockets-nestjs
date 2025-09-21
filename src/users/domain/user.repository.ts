import { userLogin } from './user-login.entity';
import { User } from './user.entity';

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  LoginUser(user: userLogin): Promise<boolean>;
  RegisterUser(user: User): Promise<boolean>;
  LogoutUser(username: string): Promise<boolean>;
}

export const USER_REPOSITORY = 'UserRepository';

