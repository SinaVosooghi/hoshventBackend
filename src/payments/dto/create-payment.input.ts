import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePaymentInput {
  @Field(() => String, { description: 'Refid of the payment' })
  refid: string;

  @Field(() => String, { description: 'Authority of the payment' })
  authority: string;

  @Field(() => String, { description: 'Payment method of the payment' })
  paymentmethod: string;

  @Field(() => String, { description: 'Status of the payment' })
  statusCode: string;

  @Field(() => Number, { description: 'User of the payment' })
  user: number;

  @Field(() => Number, { description: 'product of the payment' })
  product: number;

  @Field(() => Number, { description: 'Course of the payment' })
  course: number;

  @Field(() => Number, { description: 'Amount of the payment' })
  amount: number;
}
