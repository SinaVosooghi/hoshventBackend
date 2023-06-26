import { InputType, Int, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { Stream } from 'stream';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}
@InputType()
export class CreateSettingInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  companyName: string;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  phoneNumber: string;

  @Field({ nullable: true })
  keywords: string;

  @Field({ nullable: true })
  email: string;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Service',
    nullable: true,
  })
  logo: Promise<FileUpload>;

  @Field({ nullable: true })
  logo_second: string;

  @Field({ nullable: true })
  favicon: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  seodescription: string;

  @Field({ nullable: true })
  about: string;

  @Field({ nullable: true })
  contact: string;

  @Field({ nullable: true })
  faq: string;

  @Field({ nullable: true })
  tax: number;

  @Field({ nullable: true })
  copyright: string;

  @Field({ nullable: true })
  policy: string;

  @Field({ defaultValue: false })
  maintenance?: boolean;

  @Field({ nullable: true })
  whatsapp: string;

  @Field({ nullable: true })
  workinghours: string;

  @Field({ nullable: true })
  facebook: string;

  @Field({ nullable: true })
  linkedin: string;

  @Field({ nullable: true })
  twitter: string;

  @Field({ nullable: true })
  youtube: string;

  @Field({ nullable: true })
  instagram: string;

  @Field({ nullable: true })
  currency: string;
}
