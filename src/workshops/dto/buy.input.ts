import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class BuyWorkshopInput {
  @Field(() => Number, { description: 'id of the course' })
  id: number;
}
