import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { OrderPaginate } from './entities/paginate';
import { GetOrdersArgs } from './dto/get-orders';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { GetOrderArgs } from './dto/get-order';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  createOrder(@Args('input') createOrderInput: CreateOrderInput) {
    return this.ordersService.create(createOrderInput);
  }

  @Query(() => OrderPaginate, { name: 'orders' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getOrdersArgs: GetOrdersArgs) {
    return this.ordersService.findAll(getOrdersArgs);
  }

  @Query(() => Order, { name: 'order' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args() getOrderArgs: GetOrderArgs) {
    return this.ordersService.findOne(getOrderArgs);
  }

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  updateOrder(@Args('input') updateOrderInput: UpdateOrderInput) {
    return this.ordersService.update(updateOrderInput.id, updateOrderInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeOrder(@Args('id', { type: () => Int }) id: number) {
    return this.ordersService.remove(id);
  }
}
