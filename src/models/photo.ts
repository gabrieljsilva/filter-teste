import { Field, ID, ObjectType } from '@nestjs/graphql';
import Prisma from '@prisma/client';

import { Category } from './category';

import {
  FilterableEntity,
  FilterableField,
} from '@gabrieljsilva/nest-graphql-filters';
import { Upload } from './upload';

@FilterableEntity()
@ObjectType()
export class Photo implements Prisma.Photo {
  @Field(() => ID)
  @FilterableField(() => ID)
  id: string;

  uploadId: string;

  @FilterableField(() => Upload)
  upload: Upload;

  @FilterableField()
  categoryId: string;

  @FilterableField()
  userId: string;

  @Field(() => [Category])
  @FilterableField(() => [Category])
  category: Category[];
}
