import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

@Injectable()
export class AppService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly pool: Pool) {
    process.on("SIGINT", ()=>{
      if(pool){
        pool.end()
      }
    });
    process.on("SIGTERM", ()=>{
      if(pool){
        pool.end()
      }
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
