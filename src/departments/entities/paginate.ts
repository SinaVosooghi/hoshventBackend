import { Field, ObjectType } from '@nestjs/graphql';
import { Department } from './department.entity';

@ObjectType()
export class DepartmentPaginate {
  @Field(() => [Department], { nullable: true })
  departments: [Department];
  @Field(() => Number)
  count: number;
}
