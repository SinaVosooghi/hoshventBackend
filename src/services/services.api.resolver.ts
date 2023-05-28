import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ServicesService } from './services.service';
import { ServicePaginate } from './entities/paginate';
import { Service } from './entities/services.entity';
import { GetServicesArgs } from './dto/get-items.args';

@Resolver(() => Service)
export class ServicesApiResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Query(() => ServicePaginate, { name: 'servicesApi' })
  findAll(@Args('input') getServicesArgs: GetServicesArgs) {
    return this.servicesService.findAll(getServicesArgs);
  }
}
