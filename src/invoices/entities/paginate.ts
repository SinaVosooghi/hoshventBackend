import { Field, ObjectType } from '@nestjs/graphql';
import { Invoice } from './invoice.entity';

@ObjectType()
export class InvoicePaginate {
  @Field(() => [Invoice], { nullable: true })
  invoices: [Invoice];
  @Field(() => Number)
  count: number;
}
