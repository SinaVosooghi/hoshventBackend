import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Category } from 'src/categories/entities/category.entity';
import { ProductVariationType } from '../entities/product.entity';

@InputType()
export class CreateProductInput {
  @Field(() => String, { description: 'title of the product' })
  title: string;

  @Field(() => String, { description: 'body of the product', nullable: true })
  body: string;

  @Field(() => String, { description: 'Slug of the Category' })
  slug: string;

  @Field(() => [String], {
    description: 'Image of the product',
    nullable: true,
  })
  image: string[];

  @Field(() => [GraphQLJSONObject], { nullable: true })
  prerequisite?: ProductVariationType[];

  @Field(() => [GraphQLJSONObject], { nullable: true })
  variations?: ProductVariationType[];

  @Field(() => Number, { description: 'Price of the product', nullable: true })
  price: number;

  @Field(() => Number, {
    description: 'Quantity of the product',
    nullable: true,
  })
  quantity: number;

  @Field(() => Number, {
    description: 'Off Price of the product',
    nullable: true,
  })
  offprice: number;

  @Field(() => Boolean, { description: 'Is product featured' })
  featured: boolean;

  @Field(() => Boolean, { description: 'Status of product' })
  status: boolean;

  @Field(() => Boolean, { description: 'Enable comments of product' })
  hascomment: boolean;

  @Field(() => Number, { description: 'Category of the product' })
  category: Category;

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
