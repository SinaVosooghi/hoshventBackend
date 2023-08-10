import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SlidersService } from './sliders.service';
import { Slider } from './entities/slider.entity';
import { CreateSliderInput } from './dto/create-slider.input';
import { UpdateSliderInput } from './dto/update-slider.input';
import { SliderPaginate } from './entities/sliderPaginate';
import { GetSlidersArgs } from './dto/get-sliders.args';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Slider)
export class SlidersResolver {
  constructor(private readonly slidersService: SlidersService) {}

  @Mutation(() => Slider)
  @UseGuards(GqlAuthGuard)
  createSlider(
    @Args('input') createSliderInput: CreateSliderInput,
    @CurrentUser() user: User,
  ) {
    return this.slidersService.create(createSliderInput, user);
  }

  @Query(() => SliderPaginate, { name: 'sliders' })
  @UseGuards(GqlAuthGuard)
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getSlidersArgs: GetSlidersArgs,
    @CurrentUser() user: User,
  ) {
    return this.slidersService.findAll(getSlidersArgs, user);
  }

  @Query(() => Slider, { name: 'slider' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.slidersService.findOne(id);
  }

  @Mutation(() => Slider)
  @UseGuards(GqlAuthGuard)
  updateSlider(@Args('input') updateSliderInput: UpdateSliderInput) {
    return this.slidersService.update(updateSliderInput.id, updateSliderInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeSlider(@Args('id', { type: () => Int }) id: number) {
    return this.slidersService.remove(id);
  }
}
