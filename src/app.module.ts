import { ConnectdbModule } from './connectdb/connectdb.module';
import { ConfigModule } from "@nestjs/config"
import { ServersGateway } from './servers/servers.gateway';
import { UsersModule } from './users/users.module';
import { ChannelService } from './servers/channel.service';
import { UserLoginService } from './users/app/user-login.service';
import { DomainUserService } from './users/domain/user.service';
import { MonsterService } from './servers/monster.service';
import { USER_REPOSITORY } from './users/domain/user.repository';
import { MysqlUserRepository } from './users/infrastructure/mysql-user.repository';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { UserRegisterService } from './users/app/user-register.service';
import { UserLogoutService } from './users/app/user-logout.service';

@Module({
  imports: [ConnectdbModule, ConfigModule.forRoot(), UsersModule],
  controllers: [AppController, UsersController],
  providers: [AppService, ChannelService, ServersGateway, UserLoginService, UserRegisterService, UserLogoutService, DomainUserService, MonsterService, {
    provide: USER_REPOSITORY,
    useClass: MysqlUserRepository,
  }],
  exports: [UserLoginService, UserLogoutService],
})
export class AppModule { }
