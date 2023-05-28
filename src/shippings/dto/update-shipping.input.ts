import { CreateShippingInput } from './create-shipping.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShippingInput extends PartialType(CreateShippingInput) {
  @Field(() => Int)
  id: number;
}
