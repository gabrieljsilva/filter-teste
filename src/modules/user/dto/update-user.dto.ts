import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  birthDate?: Date;

  @Field({ nullable: true })
  password?: string;
}
