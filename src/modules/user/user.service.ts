import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto';
import { PrismaService } from '../../infra';
import { Hashing } from '../../utils';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string, select?: Prisma.UserSelect) {
    return this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        credentials: {
          email: email,
        },
      },
      select: select,
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, birthDate, password } = createUserDto;

    const userAlreadyExists = await this.prisma.user.findFirst({
      where: {
        credentials: {
          email: email,
        },
      },
    });

    if (userAlreadyExists) {
      throw new Error('User already exists');
    }

    return this.prisma.user.create({
      data: {
        name: name,
        birthDate: birthDate,
        credentials: {
          create: {
            email: email,
            password: await Hashing.hash(password),
          },
        },
      },
    });
  }

  async findUsers(filters: Prisma.UserWhereInput) {
    return this.prisma.user.findMany({
      where: filters,
    });
  }

  async deleteUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('User Not Found');
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
        credentials: {
          update: {
            data: {
              deletedAt: new Date(),
            },
          },
        },
      },
    });
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const { id, name, birthDate, password } = updateUserDto;
    const user = await this.prisma.user.findUnique({
      where: {
        id: updateUserDto.id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error(`cannot find user with id ${user.id}`);
    }

    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name: name || user.name,
        birthDate: birthDate || user.birthDate,
        credentials: password && {
          update: {
            password: await Hashing.hash(password),
          },
        },
      },
    });
  }
}
