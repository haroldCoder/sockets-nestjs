import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Redisadp } from './servers/redisadp/redisadp';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new Redisadp(app);
  await redisIoAdapter.connectRedis()
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors({origin: true})

  const config = new DocumentBuilder()
    .setTitle('Sockets API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
