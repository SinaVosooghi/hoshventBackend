import { InputType, Field, Float } from '@nestjs/graphql';
import { productOptions } from '../entities/payment.entity';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Site } from 'src/sites/entities/site.entity';

@InputType()
export class CreatePaymentInput {
  @Field(() => String, { description: 'Refid of the payment', nullable: true })
  refid: string;

  @Field(() => String, {
    description: 'Authority of the payment',
    nullable: true,
  })
  authority: string;

  @Field(() => String)
  host: string;

  @Field(() => String, {
    description: 'Payment method of the payment',
    nullable: true,
  })
  paymentmethod: string;

  @Field(() => String, {
    description: 'Payment method id of the payment',
    nullable: true,
  })
  paymentMethodId: string;

  @Field(() => Number, {
    description: 'Coupon method id of the payment',
    nullable: true,
  })
  coupon: number;

  @Field(() => Float, {
    description: 'Payment method id of the payment',
    nullable: true,
  })
  payment: number;

  @Field(() => String, { description: 'Status of the payment', nullable: true })
  statusCode: string;

  @Field(() => [GraphQLJSONObject], { nullable: true })
  products?: productOptions[];

  @Field(() => String, { description: 'Type of the payment', nullable: true })
  type: 'shop' | 'event';

  @Field(() => Number, { description: 'Amount of the payment' })
  amount: number;

  @Field(() => Number, { description: 'Site of the Event', nullable: true })
  site: Site;
}
