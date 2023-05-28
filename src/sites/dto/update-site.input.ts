import { CreateSiteInput } from './create-site.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSiteInput extends PartialType(CreateSiteInput) {
  @Field(() => Int)
  id: number;
}
