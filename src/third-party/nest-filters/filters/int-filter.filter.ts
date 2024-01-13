import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class IntFilter {
  @Field(() => Int, { nullable: true })
  is?: number;

  @Field(() => Int, { nullable: true })
  like?: number;

  @Field(() => [Int], { nullable: 'itemsAndList' })
  in?: Array<number>;

  @Field(() => Int, { nullable: true })
  gt?: number;

  @Field(() => Int, { nullable: true })
  lt?: number;

  @Field(() => Int, { nullable: true })
  gte?: number;

  @Field(() => Int, { nullable: true })
  lte?: number;
}
