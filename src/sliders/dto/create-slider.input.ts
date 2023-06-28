import { InputType, Field } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
@InputType()
export class CreateSliderInput {
  @Field(() => String, { nullable: true })
  body: string;

  @Field(() => String)
  link: string;

  @Field(() => String, { nullable: true })
  alt: string;

  @Field(() => Boolean)
  status: boolean;

  @Field(() => Boolean)
  featured: boolean;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Service',
    nullable: true,
  })
  image: Promise<FileUpload>;
}
