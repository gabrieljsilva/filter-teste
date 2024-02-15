import Prisma from '@prisma/client';
import { Field } from '@nestjs/graphql';
import {
  FilterableEntity,
  FilterableField,
} from '@gabrieljsilva/nest-graphql-filters';

@FilterableEntity()
export class Upload implements Prisma.Upload {
  @Field()
  @FilterableField()
  id: string;

  @Field()
  @FilterableField()
  url: string;

  @Field()
  // @FilterableField()
  createdAt: Date;

  @Field()
  // @FilterableField()
  deletedAt: Date;
}
