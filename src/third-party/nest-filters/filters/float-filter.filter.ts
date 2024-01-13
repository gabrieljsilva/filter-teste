import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class FloatFilter {
  @Field(() => Float, { nullable: true })
  is?: number;

  @Field(() => Float, { nullable: true })
  like?: number;

  @Field(() => [Float], { nullable: 'itemsAndList' })
  in?: Array<number>;

  @Field(() => Float, { nullable: true })
  gt?: number;

  @Field(() => Float, { nullable: true })
  lt?: number;

  @Field(() => Float, { nullable: true })
  gte?: number;

  @Field(() => Float, { nullable: true })
  lte?: number;
}
