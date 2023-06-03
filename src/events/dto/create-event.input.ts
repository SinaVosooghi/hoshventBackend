import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { Category } from 'src/categories/entities/category.entity';
import { Site } from 'src/sites/entities/site.entity';
import { Stream } from 'stream';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

@InputType()
export class CreateEventInput {
  @Field(() => String, { description: 'title of the Event' })
  title: string;

  @Field(() => String, { description: 'body of the Event' })
  body: string;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Event',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Number, { description: 'Site of the Event' })
  site: Site;

  @Field(() => Number, { description: 'Site of the Event' })
  category: Category;

  @Field(() => Boolean, { description: 'Status of the Event' })
  status: boolean;

  @Field(() => Boolean, {
    description: 'Featured of the Event',
    nullable: true,
  })
  featured: boolean;

  @Field(() => Number, {
    description: 'Price of the Event',
    nullable: true,
  })
  price: number;

  @Field(() => String, { description: 'Slug of the Event' })
  slug: string;

  @Field(() => String, {
    description: 'Body SEO of the Event',
    nullable: true,
  })
  seobody: string;

  @Field(() => String, {
    description: 'Title SEO of the Event',
    nullable: true,
  })
  seotitle: string;

  @Field(() => Number, {
    description: 'Capacity of seminar',
    nullable: true,
  })
  capacity: number;

  @Field(() => Date, {
    description: 'Startdate of workshop',
    nullable: true,
  })
  start_date: Date;

  @Field(() => Date, {
    description: 'Enddate of workshop',
    nullable: true,
  })
  end_date: Date;
}
