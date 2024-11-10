import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectdbModule } from './connectdb/connectdb.module';
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [ConnectdbModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
