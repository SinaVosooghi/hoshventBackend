import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreatePlanInput } from './create-service.input';

@InputType()
export class UpdatePlanInput extends PartialType(CreatePlanInput) {
  @Field(() => Int)
  id: number;
}
