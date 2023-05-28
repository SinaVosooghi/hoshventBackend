import { Field, ObjectType } from '@nestjs/graphql';
import { Service } from './services.entity';

@ObjectType()
export class ServicePaginate {
  @Field(() => [Service], { nullable: true })
  services: [Service];
  @Field(() => Number)
  count: number;
}
