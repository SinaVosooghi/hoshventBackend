import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTimelineInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  url: string;
}
