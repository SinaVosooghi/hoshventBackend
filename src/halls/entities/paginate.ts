import { Field, ObjectType } from '@nestjs/graphql';
import { Hall } from './hall.entity';

@ObjectType()
export class HallPaginate {
  @Field(() => [Hall], { nullable: true })
  halls: [Hall];
  @Field(() => Number)
  count: number;
}
