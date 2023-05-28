import { Field, ObjectType } from '@nestjs/graphql';
import { Site } from './site.entity';

@ObjectType()
export class SitePaginate {
  @Field(() => [Site], { nullable: true })
  sites: [Site];
  @Field(() => Number)
  count: number;
}
