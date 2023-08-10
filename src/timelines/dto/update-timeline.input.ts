import { CreateTimelineInput } from './create-timeline.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTimelineInput extends PartialType(CreateTimelineInput) {
  @Field(() => Int)
  id: number;
}
