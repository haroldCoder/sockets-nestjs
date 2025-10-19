import { Inject, Injectable } from '@nestjs/common';
import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class MysqlUserRepository implements UserRepository {
  constructor(@Inject('DATABASE_CONNECTION') private readonly pool: Pool) { }

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM Users WHERE username = ?',
      [username],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as User;
  }

  async RegisterUser(user: User): Promise<boolean> {
    try {
      const { username, password, id, ip } = user;
      await this.pool.query(
        'INSERT INTO Users(username, password, id, ip) VALUES(?, ?, ?, ?)',
        [username, password, id, ip],
      );
      return true;
    }
    catch (err) {
      console.log(err);
      return false;
    }

  }

  async LoginUser(user: User): Promise<boolean> {
    try {
      const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
        await this.pool.query(
          `SELECT * FROM Users WHERE username = "${user.username}" AND password = "${user.password}"`,
        );
      if (rows.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async LogoutUser(username: string): Promise<boolean> {
    try {
      const user = await this.findByUsername(username);
      if (!user) {
        return false;
      }

      return true;
    } catch (err) {
      console.log('Error during logout:', err);
      return false;
    }
  }
}
