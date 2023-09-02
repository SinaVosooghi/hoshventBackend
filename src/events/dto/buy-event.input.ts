import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class BuyEventInput {
  @Field(() => Number, { description: 'id of the course' })
  id: number;
}
