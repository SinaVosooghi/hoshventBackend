import { CreateHallInput } from './create-hall.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateHallInput extends PartialType(CreateHallInput) {
  @Field(() => Int)
  id: number;
}
