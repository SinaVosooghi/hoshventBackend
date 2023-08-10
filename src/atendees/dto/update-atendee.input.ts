import { CreateAtendeeInput } from './create-atendee.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAttendeeInput extends PartialType(CreateAtendeeInput) {
  @Field(() => Int)
  id: number;
}
