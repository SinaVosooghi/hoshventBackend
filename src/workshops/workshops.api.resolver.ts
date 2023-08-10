import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkshopsService } from './workshops.service';
import { Workshop } from './entities/workshop.entity';
import { CreateWorkshopInput } from './dto/create-workshop.input';
import { UpdateWorkshopInput } from './dto/update-workshop.input';
import { WorkshopPaginate } from './entities/paginate';
import { GetWorkshopsArgs } from './dto/get-items.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Workshop)
export class WorkshopsApiResolver {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Mutation(() => Workshop)
  @UseGuards(GqlAuthGuard)
  createWorkshop(
    @Args('input') createWorkshopInput: CreateWorkshopInput,
    @CurrentUser() user: User,
  ) {
    return this.workshopsService.create(createWorkshopInput, user);
  }

  @Query(() => WorkshopPaginate, { name: 'workshopsApi' })
  findAll(
    @Args('input') getWorkshopsArgs: GetWorkshopsArgs,
    @CurrentUser() user: User,
  ) {
    return this.workshopsService.findAll(getWorkshopsArgs, user);
  }

  @Query(() => Workshop, { name: 'workshopApi' })
  findOne(@Args('slug', { type: () => String }) slug: string) {
    return this.workshopsService.findOneBySlug(slug);
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
