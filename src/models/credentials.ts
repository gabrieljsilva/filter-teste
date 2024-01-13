import { Field, ObjectType } from '@nestjs/graphql';
import Prisma from '@prisma/client';

import { FilterableEntity, FilterableField } from '../third-party/nest-filters';

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
}
