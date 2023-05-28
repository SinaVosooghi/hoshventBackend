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
export class CreatePlanInput {
  @Field(() => String, { description: 'title of the Plan' })
  title: string;

  @Field(() => String, { description: 'body of the Plan' })
  body: string;

  @Field(() => Number, { description: 'body of the Plan', nullable: true })
  price: number;

  @Field(() => Number, { description: 'Sms of the Plan', nullable: true })
  sms: number;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Plan',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Boolean, { description: 'Status of the Plan' })
  status: boolean;
}
