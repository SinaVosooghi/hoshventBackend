import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SlidersService } from './sliders.service';
import { Slider } from './entities/slider.entity';
import { CreateSliderInput } from './dto/create-slider.input';
import { UpdateSliderInput } from './dto/update-slider.input';
import { SliderPaginate } from './entities/sliderPaginate';
import { GetSlidersArgs } from './dto/get-sliders.args';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => Slider)
export class SlidersResolver {
  constructor(private readonly slidersService: SlidersService) {}

  @Mutation(() => Slider)
  createSlider(@Args('input') createSliderInput: CreateSliderInput) {
    return this.slidersService.create(createSliderInput);
  }

  @Query(() => SliderPaginate, { name: 'sliders' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getSlidersArgs: GetSlidersArgs) {
    return this.slidersService.findAll(getSlidersArgs);
  }

  @Query(() => Slider, { name: 'slider' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.slidersService.findOne(id);
  }

  @Mutation(() => Slider)
  updateSlider(@Args('input') updateSliderInput: UpdateSliderInput) {
    return this.slidersService.update(updateSliderInput.id, updateSliderInput);
  }

  @Mutation(() => Boolean)
  removeSlider(@Args('id', { type: () => Int }) id: number) {
    return this.slidersService.remove(id);
  }
}
