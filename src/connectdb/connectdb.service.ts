import { Injectable } from '@nestjs/common';
import { createPool } from 'mysql2/promise';

@Injectable()
export class ConnectdbService {
  dataProvider: Array<any> = [];

  constructor() {
    this.dataProvider = [
      {
        provide: 'DATABASE_CONNECTION',
        useFactory: async () => {
          await createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
            connectionLimit: 10,
          }).query("SELECT 1")

          console.log("Connect db")
        },
      },
    ];
  }
}
