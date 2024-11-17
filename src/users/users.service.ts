import { Inject, Injectable } from '@nestjs/common';
import { FieldPacket, Pool, QueryResult, RowDataPacket } from 'mysql2/promise';
import { Users } from 'src/interfaces/users';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly pool: Pool) {}

  async getAllusers() {
    try {
      const [res] = await this.pool.query(`SELECT * FROM users`);
      return res;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async addUser(data: Users): Promise<boolean> {
    try {
      await this.pool.query(`INSERT INTO users(username, password, id, ip)
             VALUES("${data.username}", "${data.password}", "${data.id}", "${data.ip}")`);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async modifyUser({ server }: Users, id: number): Promise<string> {
    try {
      await this.pool.query(
        `UPDATE users SET server = "${server}" WHERE id = ${id}`,
      );
      return `User modified with server: ${server}`;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async LoginUser(data: Users): Promise<boolean> {
    try {
      const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
        await this.pool.query(
          `SELECT * FROM users WHERE username = "${data.username}" AND password = "${data.password}"`,
        );
      if (rows.length > 0) {
        return true;
      } else {
        const result = await this.addUser(data);
        if (result) {
          return true;
        } else {
          return false;
        }
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
