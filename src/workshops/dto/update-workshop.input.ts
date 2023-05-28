import { CreateWorkshopInput } from './create-workshop.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateWorkshopInput extends PartialType(CreateWorkshopInput) {
  @Field(() => Int)
  id: number;
}
