import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PaymentPaginate } from './entities/paginate';
import { GetPaymentsArgs } from './dto/get-payments.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  createPayment(
    @Args('input') createPaymentInput: CreatePaymentInput,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.create(createPaymentInput, user);
  }

  @Query(() => PaymentPaginate, { name: 'payments' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getPaymentsArgs: GetPaymentsArgs) {
    return this.paymentService.findAll(getPaymentsArgs);
  }

  @Query(() => Payment, { name: 'payment' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.paymentService.findOne(id);
  }

  @Mutation(() => Payment)
  @UseGuards(GqlAuthGuard)
  updatePayment(@Args('input') updatePaymentInput: UpdatePaymentInput) {
    return this.paymentService.update(
      updatePaymentInput.id,
      updatePaymentInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removePayment(@Args('id', { type: () => Int }) id: number) {
    return this.paymentService.remove(id);
  }
}
