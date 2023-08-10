import { Field, ObjectType } from '@nestjs/graphql';
import { Menu } from './menu.entity';

@ObjectType()
export class MenuPaginate {
  @Field(() => [Menu], { nullable: true })
  menus: [Menu];
  @Field(() => Number)
  count: number;
}
