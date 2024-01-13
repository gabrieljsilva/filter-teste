import { Field, ID, ObjectType } from '@nestjs/graphql';
import { FilterableEntity, FilterableField } from '../third-party/nest-filters';

import { Photo } from './photo';
import { Credentials } from './credentials';

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
  @FilterableField()
  birthDate: Date;

  @Field()
  @FilterableField()
  createdAt: Date;

  @Field({ nullable: true })
  @FilterableField()
  deletedAt: Date;

  @Field(() => [Photo])
  @FilterableField(() => [Photo])
  photos: Photo[];

  credentialsId: string;

  @Field(() => Credentials)
  @FilterableField(() => Credentials)
  credentials: Credentials;
}
