import { Module } from '@nestjs/common';
import { ServersGateway } from './servers.gateway';
import { MonsterService } from './monster.service';
import { UserLoginService } from 'src/users/app/user-login.service';
import { ChannelService } from './channel.service';

@Module({
    providers: [
        ServersGateway,
        UserLoginService,
        ChannelService,
        MonsterService,
    ],

})
export class ServersModule { }