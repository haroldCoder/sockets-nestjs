import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectdbModule } from './connectdb/connectdb.module';
import { ConfigModule } from "@nestjs/config"
import { ServersGateway } from './servers/servers.gateway';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [ConnectdbModule, ConfigModule.forRoot(), UsersModule],
  controllers: [AppController],
  providers: [AppService, UsersService, ServersGateway],
})
export class AppModule {}
