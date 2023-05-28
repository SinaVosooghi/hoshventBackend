import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Department } from 'src/departments/entities/department.entity';

@ArgsType()
@InputType()
export class GetChatsArgs {
  @Field({ nullable: true })
  limit: number;

  @Field()
  skip: number;

  @Field({ nullable: true })
  status: boolean;

  @Field({ nullable: true })
  priority: 'high' | 'medium' | 'low';

  @Field({ nullable: true })
  type: 'alert' | 'success' | 'info' | 'warning';

  @Field(() => Number, { nullable: true })
  department: number;

  @Field({ nullable: true })
  searchTerm?: string;
}
