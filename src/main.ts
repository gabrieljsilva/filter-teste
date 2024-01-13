import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestFilterModule } from './third-party/nest-filters/module';
import { ToPrismaQueryPipe } from './pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
