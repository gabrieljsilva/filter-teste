import { Field, ObjectType } from '@nestjs/graphql';
import { forwardRef } from '@nestjs/common';
import Prisma from '@prisma/client';

import { FilterableEntity, FilterableField } from '../third-party/nest-filters';
import { User } from './user';

@FilterableEntity()
@ObjectType()
export class Credentials implements Prisma.Credentials {
  @Field()
  id: string;

  @Field()
  @FilterableField()
  email: string;

  password: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  deletedAt: Date;

  @FilterableField(() => forwardRef(() => User))
  user: User;
}
