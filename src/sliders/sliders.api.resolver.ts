import { Resolver, Query, Args } from '@nestjs/graphql';
import { SlidersService } from './sliders.service';
import { Slider } from './entities/slider.entity';

import { SliderPaginate } from './entities/sliderPaginate';
import { GetSlidersArgs } from './dto/get-sliders.args';

@Resolver(() => Slider)
export class SlidersApiResolver {
  constructor(private readonly slidersService: SlidersService) {}

  @Query(() => SliderPaginate, { name: 'slidersApi' })
  findAll(@Args('input') getSlidersArgs: GetSlidersArgs) {
    return this.slidersService.findAll(getSlidersArgs);
  }
}
