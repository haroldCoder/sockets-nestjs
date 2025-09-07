import { Module } from '@nestjs/common';
import { ConnectdbModule } from 'src/connectdb/connectdb.module';
import { UserLoginService } from './app/user-login.service';
import { DomainUserService } from './domain/user.service';
import { USER_REPOSITORY } from './domain/user.repository';
import { MysqlUserRepository } from './infrastructure/mysql-user.repository';
import { UsersController } from './users.controller';
import { UserRegisterService } from './app/user-register.service';

@Module({
  imports: [ConnectdbModule],
  controllers: [UsersController],
  providers: [
    UserLoginService,
    UserRegisterService,
    DomainUserService,
    {
      provide: USER_REPOSITORY,
      useClass: MysqlUserRepository,
    },
  ],
  exports: [UserLoginService, UserRegisterService],
})
export class UsersModule {}
