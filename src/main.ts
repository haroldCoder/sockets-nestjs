import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Redisadp } from './servers/redisadp/redisadp';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new Redisadp(app);
  await redisIoAdapter.connectRedis()
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors({origin: true})
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
