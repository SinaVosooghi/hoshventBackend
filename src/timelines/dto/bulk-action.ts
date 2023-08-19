import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class Bulkaction {
  @Field(() => [Int], { nullable: true })
  ids: [number];

  @Field(() => String)
  type: string;

  @Field(() => Int)
  actionId: number;
}
