import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { NestFilterModule } from './third-party/nest-filters/module';
import { PrismaModule } from './infra';
import { UserModule } from './modules';
import { AuthModule } from './modules/auth/auth.module';
import { formatError } from './utils';

@Module({
  imports: [
    PrismaModule,
    NestFilterModule.register(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      formatError,
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
