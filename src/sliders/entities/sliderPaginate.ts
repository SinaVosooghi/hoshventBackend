import { Field, ObjectType } from '@nestjs/graphql';
import { Slider } from './slider.entity';

@ObjectType()
export class SliderPaginate {
  @Field(() => [Slider], { nullable: true })
  sliders: [Slider];
  @Field(() => Number)
  count: number;
}
