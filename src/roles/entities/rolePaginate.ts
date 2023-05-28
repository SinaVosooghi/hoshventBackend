import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from './role.entity';

@ObjectType()
export class RolePaginate {
  @Field(() => [Role], { nullable: true })
  roles: [Role];
  @Field(() => Number)
  count: number;
}
