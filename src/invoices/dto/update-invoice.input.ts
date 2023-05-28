import { CreateInvoiceInput } from './create-invoice.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
@InputType()
export class UpdateInvoiceInput extends PartialType(CreateInvoiceInput) {
  @Field(() => Int)
  id: number;
}
