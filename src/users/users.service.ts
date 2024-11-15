import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
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

  async addUser(data: Users): Promise<string> {
    try{
        if(!this.LoginUser(data)){
           await this.pool.query(`INSERT INTO users(username, password, id, ip)
             VALUES("${data.username}", "${data.password}", "${data.id}", "${data.ip}")`);  
             return "User added" 
        }
        else{
            return 
        }
      
    }
    catch(err){
        console.log(err);
        return err;
    }
  }

  async modifyUser({server}: Users, id: number): Promise<string>{
    try{
        await this.pool.query(`UPDATE users SET server = "${server}" WHERE id = ${id}`);
        return `User modified with server: ${server}`
    }
    catch(err){
        console.log(err);
        return err;
    }
  }

  async LoginUser(data: Users): Promise<boolean>{
    try{
        const [res]: Array<any> = await this.pool.query(`SELECT * FROM users WHERE username = ${data.username} AND password = ${data.password}`);
        if(res.length > 0){
            return true;
        }
        else{
            await this.addUser(data);
            return true;
        }
    }
    catch(err){
        console.log(err);
        return false;
    }
  }
}
