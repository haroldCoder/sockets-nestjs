import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ConnectdbModule } from 'src/connectdb/connectdb.module';

@Module({
  imports: [ConnectdbModule],
  providers: [UsersService]
})
export class UsersModule {}
