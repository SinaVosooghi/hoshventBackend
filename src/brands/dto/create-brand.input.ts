import { InputType, Field } from '@nestjs/graphql';
import { Brand } from '../entities/brand.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateBrandInput {
  @Field(() => String, { description: 'Title of the Brand' })
  title: string;

  @Field(() => String, {
    description: 'Description of the Brand',
    nullable: true,
  })
  body: string;

  @Field(() => String, {
    nullable: true,
  })
  link: string;

  @Field(() => Number, { nullable: true })
  brand: Brand;

  @Field(() => Boolean, {
    description: 'Status of the brand',
    nullable: true,
  })
  status: boolean;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Service',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Boolean, { description: 'Is course featured', nullable: true })
  featured: boolean;
}
