import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SeminarsService } from './seminars.service';
import { CreateSeminarInput } from './dto/create-seminar.input';
import { UpdateSeminarInput } from './dto/update-seminar.input';
import { SeminarPaginate } from './entities/paginate';
import { GetSeminarsArgs } from './dto/get-items.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Seminar } from './entities/seminar.entity';

@Resolver(() => Seminar)
export class SeminarsResolver {
  constructor(private readonly seminarsService: SeminarsService) {}

  @Mutation(() => Seminar)
  @UseGuards(GqlAuthGuard)
  createSeminar(@Args('input') createSeminarInput: CreateSeminarInput) {
    return this.seminarsService.create(createSeminarInput);
  }

  @Query(() => SeminarPaginate, { name: 'seminars' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getSeminarsArgs: GetSeminarsArgs) {
    return this.seminarsService.findAll(getSeminarsArgs);
  }

  @Query(() => Seminar, { name: 'seminar' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.seminarsService.findOne(id);
  }

  @Mutation(() => Seminar)
  @UseGuards(GqlAuthGuard)
  updateSeminar(@Args('input') updateSeminarInput: UpdateSeminarInput) {
    return this.seminarsService.update(
      updateSeminarInput.id,
      updateSeminarInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeSeminar(@Args('id', { type: () => Int }) id: number) {
    return this.seminarsService.remove(id);
  }
}
