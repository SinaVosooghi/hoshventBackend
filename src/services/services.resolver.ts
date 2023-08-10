import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ServicesService } from './services.service';
import { CreateServiceInput } from './dto/create-service.input';
import { ServicePaginate } from './entities/paginate';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Service } from './entities/services.entity';
import { GetServicesArgs } from './dto/get-items.args';
import { UpdateServiceInput } from './dto/update-items.input';

@Resolver(() => Service)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Mutation(() => Service)
  @UseGuards(GqlAuthGuard)
  createService(
    @Args('input') createServiceInput: CreateServiceInput,
    @CurrentUser() user: User,
  ) {
    return this.servicesService.create(createServiceInput, user);
  }

  @Query(() => ServicePaginate, { name: 'services' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getServicesArgs: GetServicesArgs,
    @CurrentUser() user: User,
  ) {
    return this.servicesService.findAll(getServicesArgs);
  }

  @Query(() => Service, { name: 'service' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.servicesService.findOne(id);
  }

  @Mutation(() => Service)
  @UseGuards(GqlAuthGuard)
  updateService(@Args('input') updateServiceInput: UpdateServiceInput) {
    return this.servicesService.update(
      updateServiceInput.id,
      updateServiceInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeService(@Args('id', { type: () => Int }) id: number) {
    return this.servicesService.remove(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeImage(@Args('id', { type: () => Int }) id: number) {
    return this.servicesService.removeImage(id);
  }
}
