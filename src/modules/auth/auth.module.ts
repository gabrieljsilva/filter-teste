import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [AuthService, AuthResolver],
  controllers: [],
  exports: [AuthService],
})
export class AuthModule {}
