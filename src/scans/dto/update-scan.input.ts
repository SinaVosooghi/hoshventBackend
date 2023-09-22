import { CreateScanInput } from './create-scan.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateScanInput extends PartialType(CreateScanInput) {
  @Field(() => Int)
  id: number;
}
