import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { UpdateInvoiceInput } from './dto/update-invoice.input';
import { InvoicePaginate } from './entities/paginate';
import { GetInvoicesArgs } from './dto/get-invoices.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { GetInoivceArgs } from './dto/get-invoice';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Invoice)
export class InvoicesResolver {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Mutation(() => Invoice)
  @UseGuards(GqlAuthGuard)
  createInvoice(
    @Args('input') createInvoiceInput: CreateInvoiceInput,
    @CurrentUser() user: User,
  ) {
    return this.invoicesService.create(createInvoiceInput, user);
  }

  @Query(() => InvoicePaginate, { name: 'invoices' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getInvoicesArgs: GetInvoicesArgs) {
    return this.invoicesService.findAll(getInvoicesArgs);
  }

  @Query(() => Invoice, { name: 'invoice' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('') getInvoiceArgs: GetInoivceArgs) {
    return this.invoicesService.findOne(getInvoiceArgs);
  }

  @Mutation(() => Invoice)
  @UseGuards(GqlAuthGuard)
  updateInvoice(@Args('input') updateInvoiceInput: UpdateInvoiceInput) {
    return this.invoicesService.update(
      updateInvoiceInput.id,
      updateInvoiceInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeInvoice(@Args('id', { type: () => Int }) id: number) {
    return this.invoicesService.remove(id);
  }
}
