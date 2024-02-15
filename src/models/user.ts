import { Field, ID, ObjectType } from '@nestjs/graphql';

import { FilterableEntity, FilterableField, SortableEntity } from '@gabrieljsilva/nest-graphql-filters';

import { Photo } from './photo';
import { Credentials } from './credentials';

@SortableEntity()
@FilterableEntity()
@ObjectType()
export class User {
  @Field()
  @FilterableField(() => ID)
  id: string;

  @Field()
  @FilterableField()
  name: string;

  @Field()
  // @FilterableField()
  birthDate: Date;

  @Field()
  // @FilterableField()
  createdAt: Date;

  @Field({ nullable: true })
  // @FilterableField({ nullable: true })
  deletedAt?: Date;

  @Field(() => [Photo])
  @FilterableField(() => [Photo])
  photos: Photo[];

  @FilterableField()
  credentialsId: string;

  @Field(() => [String])
  @FilterableField(() => [String])
  tags: string[];

  @Field(() => Credentials)
  @FilterableField(() => Credentials)
  credentials: Credentials;
}
