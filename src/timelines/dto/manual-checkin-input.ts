import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ServiceTypes } from 'src/payment/entities/payment.entity';

@InputType()
export class ManualCheckinInput {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field(() => Int)
  aid: number;

  @Field(() => String)
  type: string;

  @Field(() => Number, { nullable: true })
  service?: number;
}
