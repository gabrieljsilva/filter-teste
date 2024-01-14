import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { FilterArgs, FilterOf } from '../../third-party/nest-filters';

import { PrismaService } from '../../infra';
import { UserService } from './user.service';

import { User, Photo, Credentials } from '../../models';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ToPrismaQueryPipe } from '../../pipes';
import { UsePipes } from '@nestjs/common';

@Resolver(User)
export class UserResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Mutation(() => User)
  async deleteUserById(@Args('userId') userId: string) {
    return this.userService.deleteUserById(userId);
  }

  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto);
  }

  @Query(() => [User])
  async findUsers(
    @FilterArgs(User)
    userFilter: FilterOf<User>,
  ) {
    return this.userService.findUsers(userFilter);
  }

  @ResolveField(() => Credentials)
  async credentials(@Parent() user: User) {
    return this.prisma.credentials.findFirst({
      where: {
        id: user.credentialsId,
      },
    });
  }

  @ResolveField(() => Photo)
  async photos(@Parent() user: User) {
    return this.prisma.photo.findMany({
      where: {
        userId: user.id,
      },
    });
  }
}
