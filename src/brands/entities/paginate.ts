import { Field, ObjectType } from '@nestjs/graphql';
import { Brand } from './brand.entity';

@ObjectType()
export class BrandPaginate {
  @Field(() => [Brand], { nullable: true })
  brands: [Brand];
  @Field(() => Number)
  count: number;
}
