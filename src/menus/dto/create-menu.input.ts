import { InputType, Field } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateMenuInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  link: string;

  @Field(() => Number)
  order: number;

  @Field(() => Boolean, {
    nullable: true,
  })
  status: boolean;
}
