import { InputType, Field } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateCertificateInput {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  itemLayout: string;

  @Field(() => Boolean)
  status: boolean;

  @Field(() => String)
  type: 'seminar' | 'workshop';

  @Field(() => GraphQLUpload, {
    nullable: true,
  })
  image: Promise<FileUpload>;
}
