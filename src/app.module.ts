import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectdbModule } from './connectdb/connectdb.module';
import { ConfigModule } from "@nestjs/config"
import { ServersGateway } from './servers/servers.gateway';
import { UsersModule } from './users/users.module';
import { ChannelService } from './servers/channel.service';
import { UserLoginService } from './users/app/user-login.service';
import { DomainUserService } from './users/domain/user.service';
import { USER_REPOSITORY } from './users/domain/user.repository';
import { MysqlUserRepository } from './users/infrastructure/mysql-user.repository';

@Module({
  imports: [ConnectdbModule, ConfigModule.forRoot(), UsersModule],
  controllers: [AppController],
  providers: [AppService, ChannelService, ServersGateway, UserLoginService, DomainUserService, {
    provide: USER_REPOSITORY,
    useClass: MysqlUserRepository,
  }],
  exports: [UserLoginService],
})
export class AppModule {}
