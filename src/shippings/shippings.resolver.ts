import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ShippingsService } from './shippings.service';
import { Shipping } from './entities/shipping.entity';
import { CreateShippingInput } from './dto/create-shipping.input';
import { UpdateShippingInput } from './dto/update-shipping.input';
import { ShippingPaginate } from './entities/paginate';
import { GetShippingsArgs } from './dto/get-shippings.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Shipping)
export class ShippingsResolver {
  constructor(private readonly shippingsService: ShippingsService) {}

  @Mutation(() => Shipping)
  @UseGuards(GqlAuthGuard)
  createShipping(@Args('input') createShippingInput: CreateShippingInput) {
    return this.shippingsService.create(createShippingInput);
  }

  @Query(() => ShippingPaginate, { name: 'shippings' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getShippingsArgs: GetShippingsArgs) {
    return this.shippingsService.findAll(getShippingsArgs);
  }

  @Query(() => Shipping, { name: 'shipping' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.shippingsService.findOne(id);
  }

  @Mutation(() => Shipping)
  @UseGuards(GqlAuthGuard)
  updateShipping(@Args('input') updateShippingInput: UpdateShippingInput) {
    return this.shippingsService.update(
      updateShippingInput.id,
      updateShippingInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeShipping(@Args('id', { type: () => Int }) id: number) {
    return this.shippingsService.remove(id);
  }
}
