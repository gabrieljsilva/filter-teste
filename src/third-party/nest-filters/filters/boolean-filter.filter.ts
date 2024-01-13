import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BooleanFilter {
  @Field(() => Boolean, { nullable: true })
  is?: boolean;
}
