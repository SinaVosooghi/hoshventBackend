import { InputType, Field } from '@nestjs/graphql';
import { Category } from 'src/categories/entities/category.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateBlogInput {
  @Field(() => String, { description: 'title of the blog' })
  title: string;

  @Field(() => String, { description: 'body of the blog' })
  body: string;

  @Field(() => Number, { description: 'Read time of the blog', nullable: true })
  readtime: number;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Service',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Number, { description: 'Category of the blog' })
  category: Category;

  @Field(() => Boolean, { description: 'Status of the blog' })
  status: boolean;

  @Field(() => Boolean, { description: 'Featured of the blog' })
  featured: boolean;

  @Field(() => String, { description: 'Slug of the blog' })
  slug: string;

  @Field(() => String, {
    description: 'Body SEO of the blog',
    nullable: true,
  })
  seobody: string;

  @Field(() => String, {
    description: 'Title SEO of the blog',
    nullable: true,
  })
  seotitle: string;
}
