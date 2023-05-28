import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateInvoiceInput {
  @Field(() => String, { description: 'Title of the invoice', nullable: true })
  note: string;

  @Field(() => String, { description: 'Type of the invoice' })
  type: 'shop' | 'course';

  @Field(() => Boolean, { description: 'Payment has been done of the invoice' })
  donepayment: boolean;

  @Field(() => String, { description: 'Payment type of the invoice' })
  paymenttype: 'online' | 'delivery';

  @Field(() => Number, { description: 'Invoice number of the invoice' })
  invoicenumber: number;

  @Field(() => Number, {
    description: 'User of invoice',
    nullable: true,
  })
  user: User;

  @Field(() => Number, {
    description: 'Shipping of invoice',
    nullable: true,
  })
  shipping: number;

  @Field(() => Number, {
    description: 'discount of invoice',
    nullable: true,
  })
  coupon: number;

  @Field(() => Number, {
    description: 'Payment of the invoice',
    nullable: true,
  })
  payment: Payment;

  @Field(() => Date, { nullable: true })
  issuedate: Date;

  @Field(() => Date, { nullable: true })
  duedate: Date;

  @Field(() => String, {
    description: 'Salesperson of the invoice',
    nullable: true,
  })
  salesperson: string;

  @Field(() => [GraphQLJSONObject], { nullable: true })
  items: object[];

  @Field(() => Number, { nullable: true })
  order: number;
}
