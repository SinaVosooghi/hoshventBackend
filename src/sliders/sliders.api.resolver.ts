import { Resolver, Query, Args } from '@nestjs/graphql';
import { SlidersService } from './sliders.service';
import { Slider } from './entities/slider.entity';

import { SliderPaginate } from './entities/sliderPaginate';
import { GetSlidersArgs } from './dto/get-sliders.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Slider)
export class SlidersApiResolver {
  constructor(private readonly slidersService: SlidersService) {}

  @Query(() => SliderPaginate, { name: 'slidersApi' })
  findAll(@Args('input') getSlidersArgs: GetSlidersArgs) {
    return this.slidersService.findAllApi(getSlidersArgs);
  }
}
