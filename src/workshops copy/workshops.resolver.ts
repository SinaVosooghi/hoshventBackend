import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkshopsService } from './workshops.service';
import { Workshop } from './entities/workshop.entity';
import { CreateWorkshopInput } from './dto/create-workshop.input';
import { UpdateWorkshopInput } from './dto/update-workshop.input';
import { WorkshopPaginate } from './entities/paginate';
import { GetWorkshopsArgs } from './dto/get-items.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Workshop)
export class WorkshopsResolver {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Mutation(() => Workshop)
  @UseGuards(GqlAuthGuard)
  createWorkshop(@Args('input') createWorkshopInput: CreateWorkshopInput) {
    return this.workshopsService.create(createWorkshopInput);
  }

  @Query(() => WorkshopPaginate, { name: 'workshops' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getWorkshopsArgs: GetWorkshopsArgs) {
    return this.workshopsService.findAll(getWorkshopsArgs);
  }

  @Query(() => Workshop, { name: 'workshop' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workshopsService.findOne(id);
  }

  @Mutation(() => Workshop)
  @UseGuards(GqlAuthGuard)
  updateWorkshop(@Args('input') updateWorkshopInput: UpdateWorkshopInput) {
    return this.workshopsService.update(
      updateWorkshopInput.id,
      updateWorkshopInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeWorkshop(@Args('id', { type: () => Int }) id: number) {
    return this.workshopsService.remove(id);
  }
}
