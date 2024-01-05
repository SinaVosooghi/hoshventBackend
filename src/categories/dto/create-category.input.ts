import { InputType, Field } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateCategoryInput {
  @Field(() => String, { description: 'Title of the Category' })
  title: string;

  @Field(() => String, { description: 'Title of the Category', nullable: true })
  titleen: string;

  @Field(() => String, { description: 'Title of the Category' })
  slug: string;

  @Field(() => String, { description: 'Type of the Category' })
  type: 'site' | 'blog' | 'event';

  @Field(() => String, {
    description: 'Description of the Category',
    nullable: true,
  })
  body: string;

  @Field(() => Number, { nullable: true })
  category: Category;

  @Field(() => Boolean, {
    description: 'Status of the category',
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

  @Field(() => [Number], { nullable: true })
  services?: [number];

  @Field(() => [Number], {
    nullable: true,
  })
  seminars?: [number];

  @Field(() => [Number], {
    nullable: true,
  })
  workshops?: [number];
}
