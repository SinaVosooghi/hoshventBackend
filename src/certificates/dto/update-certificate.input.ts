import { CreateCertificateInput } from './create-certificate.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCertificateInput extends PartialType(
  CreateCertificateInput,
) {
  @Field(() => Int)
  id: number;
}
