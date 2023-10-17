import { Field, ObjectType } from '@nestjs/graphql';
import { Certificate } from './certificate.entity';

@ObjectType()
export class CertificatePaginate {
  @Field(() => [Certificate], { nullable: true })
  certificates: [Certificate];
  @Field(() => Number)
  count: number;
}
