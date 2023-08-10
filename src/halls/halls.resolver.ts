import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { HallsService } from './halls.service';
import { CreateHallInput } from './dto/create-hall.input';
import { UpdateHallInput } from './dto/update-hall.input';
import { HallPaginate } from './entities/paginate';
import { GetHallsArgs } from './dto/get-items.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Hall } from './entities/hall.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Hall)
export class HallsResolver {
  constructor(private readonly hallsService: HallsService) {}

  @Mutation(() => Hall)
  @UseGuards(GqlAuthGuard)
  createHall(
    @Args('input') createHallInput: CreateHallInput,
    @CurrentUser() user: User,
  ) {
    return this.hallsService.create(createHallInput, user);
  }

  @Query(() => HallPaginate, { name: 'halls' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getHallsArgs: GetHallsArgs,
    @CurrentUser() user: User,
  ) {
    return this.hallsService.findAll(getHallsArgs, user);
  }

  @Query(() => Hall, { name: 'hall' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.hallsService.findOne(id);
  }

  @Mutation(() => Hall)
  @UseGuards(GqlAuthGuard)
  updateHall(@Args('input') updateHallInput: UpdateHallInput) {
    return this.hallsService.update(updateHallInput.id, updateHallInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeHall(@Args('id', { type: () => Int }) id: number) {
    return this.hallsService.remove(id);
  }
}
