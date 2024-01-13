import { Field, GraphQLTimestamp, InputType } from '@nestjs/graphql';

@InputType()
export class TimestampFilter {
  @Field(() => GraphQLTimestamp, { nullable: true })
  is?: Date;

  @Field(() => [GraphQLTimestamp], { nullable: true })
  in?: Array<Date>;

  @Field(() => GraphQLTimestamp, { nullable: true })
  gt?: Date;

  @Field(() => GraphQLTimestamp, { nullable: true })
  lt?: Date;

  @Field(() => GraphQLTimestamp, { nullable: true })
  gte?: Date;

  @Field(() => GraphQLTimestamp, { nullable: true })
  lte?: Date;
}
