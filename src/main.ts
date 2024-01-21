import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientValidationFilter } from './exception-filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaClientValidationFilter());
  await app.listen(3000);
}

bootstrap();
