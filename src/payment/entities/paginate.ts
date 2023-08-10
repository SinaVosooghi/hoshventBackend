import { Field, ObjectType } from '@nestjs/graphql';
import { Payment } from './payment.entity';

@ObjectType()
export class PaymentPaginate {
  @Field(() => [Payment], { nullable: true })
  payments: [Payment];
  @Field(() => Number)
  count: number;
}
