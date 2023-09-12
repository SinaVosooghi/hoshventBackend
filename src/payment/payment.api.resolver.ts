import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PaymentPaginate } from './entities/paginate';
import { GetPaymentsArgs } from './dto/get-payments.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { VerificationInput } from './dto/verification.input';
import { PaymentWebService } from './payment.web.service';

@Resolver(() => Payment)
export class PaymentApiResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentWebService: PaymentWebService,
  ) {}

  @Query(() => PaymentPaginate, { name: 'paymentsApi' })
  @UseGuards(GqlAuthGuard)
  findAllApi(
    @CurrentUser() user: User,
    @Args('input') getPaymentsArgs: GetPaymentsArgs,
  ) {
    return this.paymentService.findAllApi(getPaymentsArgs, user);
  }

  @Query(() => PaymentPaginate, { name: 'teacherPaymentsApi' })
  @UseGuards(GqlAuthGuard)
  teacherPayments(
    @CurrentUser() user: User,
    @Args('input') getPaymentsArgs: GetPaymentsArgs,
  ) {
    return this.paymentService.teachersPaymentApi(getPaymentsArgs, user);
  }

  @Mutation(() => String, { name: 'doPayment' })
  @UseGuards(GqlAuthGuard)
  async increase(
    @Args('input') increaseBalanceInput: CreatePaymentInput,
    @CurrentUser() user: User,
  ) {
    return await this.paymentWebService.doPayment(increaseBalanceInput, user);
  }

  @Mutation(() => Boolean, { name: 'verification' })
  async verification(
    @Args('input') verificationInput: VerificationInput,
    @CurrentUser() user: User,
  ) {
    return await this.paymentWebService.verify(verificationInput, user);
  }
}
