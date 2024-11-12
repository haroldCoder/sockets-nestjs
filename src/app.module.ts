import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectdbModule } from './connectdb/connectdb.module';
import { ConfigModule } from "@nestjs/config"
import { ServersGateway } from './servers/servers.gateway';

@Module({
  imports: [ConnectdbModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, ServersGateway],
})
export class AppModule {}
