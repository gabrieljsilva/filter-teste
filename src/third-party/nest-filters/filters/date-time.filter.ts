import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';

@InputType()
export class DateTimeFilter {
  @Field(() => GraphQLISODateTime, { nullable: true })
  is?: Date;

  @Field(() => [GraphQLISODateTime], { nullable: 'itemsAndList' })
  in?: Array<Date>;

  @Field(() => GraphQLISODateTime, { nullable: true })
  gt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  gte?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lte?: Date;
}
