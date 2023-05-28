import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDepartmentInput {
  @Field(() => String, { description: 'Title of the Category' })
  title: string;

  @Field(() => String, {
    description: 'Description of the Category',
    nullable: true,
  })
  body: string;

  @Field(() => String, { description: 'Image of the course', nullable: true })
  image: string;

  @Field(() => Boolean, {
    description: 'Status of the category',
    nullable: true,
  })
  status: boolean;
}
