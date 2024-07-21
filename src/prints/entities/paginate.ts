import { Field, ObjectType } from '@nestjs/graphql';
import { Print } from './print.entity';

@ObjectType()
export class PrintPaginate {
  @Field(() => [Print], { nullable: true })
  prints: [Print];
  @Field(() => Number)
  count: number;
}
