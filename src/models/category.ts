import { Field, ID, ObjectType } from '@nestjs/graphql';
import Prisma from '@prisma/client';

import { FilterableEntity, FilterableField } from '../third-party/nest-filters';

@FilterableEntity()
@ObjectType()
export class Category implements Prisma.Category {
  @Field(() => ID)
  @FilterableField(() => ID)
  id: string;

  @Field()
  @FilterableField()
  name: string;

  @Field()
  @FilterableField()
  createdAt: Date;

  @Field({ nullable: true })
  @FilterableField()
  deletedAt: Date;
}
