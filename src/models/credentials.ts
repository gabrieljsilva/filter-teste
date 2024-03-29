import { Field, ObjectType } from '@nestjs/graphql';
import Prisma from '@prisma/client';

import {
  FilterableEntity,
  FilterableField,
} from '@gabrieljsilva/nest-graphql-filters';

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

  @FilterableField(() => User)
  user: User;
}
