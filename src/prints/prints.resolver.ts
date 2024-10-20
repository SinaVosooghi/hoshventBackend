import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PrintsService } from './prints.service';
import { Print } from './entities/print.entity';
import { CreatePrintInput } from './dto/create-print.input';
import { PrintPaginate } from './entities/paginate';
import { GetPrintsArgs } from './dto/get-prints.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Print)
export class PrintsResolver {
  constructor(private readonly printsService: PrintsService) {}

  @Mutation(() => Print)
  createPrint(
    @Args('input') createPrintInput: CreatePrintInput,
    @CurrentUser() user: User,
  ) {
    return this.printsService.create(createPrintInput, user);
  }

  @Mutation(() => Print)
  @UseGuards(GqlAuthGuard)
  createPrintUser(
    @Args('input') createPrintInput: CreatePrintInput,
    @CurrentUser() user: User,
  ) {
    return this.printsService.create(createPrintInput, user);
  }

  @Query(() => PrintPaginate, { name: 'prints' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getPrintsArgs: GetPrintsArgs,
    @CurrentUser() user: User,
  ) {
    return this.printsService.findAll(getPrintsArgs, user);
  }

  @Query(() => Print, { name: 'print' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.printsService.findOne(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removePrint(@Args('id', { type: () => Int }) id: number) {
    return this.printsService.remove(id);
  }
}
