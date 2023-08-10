import { Resolver, Query, Args } from '@nestjs/graphql';
import { SeminarsService } from './seminars.service';
import { SeminarPaginate } from './entities/paginate';
import { GetSeminarsArgs } from './dto/get-items.args';
import { Seminar } from './entities/seminar.entity';

@Resolver(() => Seminar)
export class SeminarsApiResolver {
  constructor(private readonly seminarsService: SeminarsService) {}

  @Query(() => SeminarPaginate, { name: 'seminarsApi' })
  findAll(@Args('input') getSeminarsArgs: GetSeminarsArgs) {
    return this.seminarsService.findAll(getSeminarsArgs);
  }

  @Query(() => Seminar, { name: 'seminarApi' })
  findOne(@Args('slug', { type: () => String }) slug: string) {
    return this.seminarsService.findOneBySlug(slug);
  }
}
