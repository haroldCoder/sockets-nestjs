import { Inject, Injectable } from '@nestjs/common';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { Users } from 'src/interfaces/users';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class MysqlUserRepository implements UserRepository {
  constructor(@Inject('DATABASE_CONNECTION') private readonly pool: Pool) {}

  async findByUsername(username: string): Promise<Users | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as Users;
  }

  async save(user: Users): Promise<Users> {
    const { username, password, id, ip } = user;
    await this.pool.query(
      'INSERT INTO users(username, password, id, ip) VALUES(?, ?, ?, ?)',
      [username, password, id, ip],
    );
    return user;
  }
}
