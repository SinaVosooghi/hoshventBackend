import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class UploadImage {
  @Field(() => GraphQLUpload, {
    description: 'Image of the Service',
    nullable: true,
  })
  image: Promise<FileUpload>;
}
