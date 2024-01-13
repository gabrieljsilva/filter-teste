import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class IdFilter {
  @Field(() => String, { nullable: true })
  is?: string;
}
