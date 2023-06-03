import { Field, ObjectType } from '@nestjs/graphql';
import { Seminar } from './seminar.entity';

@ObjectType()
export class SeminarPaginate {
  @Field(() => [Seminar], { nullable: true })
  seminars: [Seminar];
  @Field(() => Number)
  count: number;
}
