import { CreatePrintInput } from './create-print.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePrintInput extends PartialType(CreatePrintInput) {
  @Field(() => Int)
  id: number;
}
