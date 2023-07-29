import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { Stream } from 'stream';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

@InputType()
export class UploadUsersPdfInput {
  @Field(() => GraphQLUpload, {
    description: 'CSV of the users',
    nullable: true,
  })
  csv: Promise<FileUpload>;
}
