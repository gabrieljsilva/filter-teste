import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class StringFilter {
  @Field({ nullable: true })
  is?: string;

  @Field({ nullable: true })
  like?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  in?: Array<string>;
}
