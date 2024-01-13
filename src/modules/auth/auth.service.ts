import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

import { LoginDto } from './dto';
import { UserService } from '../user';
import { Hashing } from '../../utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const queryField: Prisma.UserSelect = {
      id: true,
      name: true,
      createdAt: true,
      birthDate: true,
      credentials: {
        select: {
          email: true,
          password: true,
        },
      },
    };

    const user = await this.userService.findUserByEmail(email, queryField);

    if (!user) {
      throw new Error(`user ${email} not found`);
    }

    const passwordMatches = await Hashing.compare(
      user.credentials.password,
      password,
    );

    if (!passwordMatches) {
      throw new Error(`password not match`);
    }

    delete user.credentials.password;

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.jwtService.signAsync(user);
  }
}
