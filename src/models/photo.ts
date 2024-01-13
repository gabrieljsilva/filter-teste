import { Field, ObjectType } from '@nestjs/graphql';
import Prisma from '@prisma/client';

import { Category } from './category';

import { FilterableEntity, FilterableField } from '../third-party/nest-filters';

@FilterableEntity()
@ObjectType()
export class Photo implements Prisma.Photo {
  @Field()
  @FilterableField()
  id: string;

  @Field()
  @FilterableField()
  url: string;

  @Field()
  @FilterableField()
  createdAt: Date;

  @Field({ nullable: true })
  @FilterableField()
  deletedAt: Date;

  @FilterableField()
  categoryId: string;

  @FilterableField()
  userId: string;

  @Field()
  @FilterableField()
  category: Category;
}
