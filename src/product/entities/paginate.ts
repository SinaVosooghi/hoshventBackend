import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.entity';

@ObjectType()
export class ProductPaginate {
  @Field(() => [Product], { nullable: true })
  products: [Product];

  @Field(() => Number)
  count: number;
}
