import { Field, ID, ObjectType } from '@nestjs/graphql';
import Prisma from '@prisma/client';
import {
  FilterableEntity,
  FilterableField,
} from '@gabrieljsilva/nest-graphql-filters';

@FilterableEntity()
@ObjectType()
export class Category implements Prisma.Category {
  @Field()
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
