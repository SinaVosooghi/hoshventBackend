import { InputType, Field } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Hall } from 'src/halls/entities/hall.entity';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateWorkshopInput {
  @Field(() => String, { description: 'Title of the workshop' })
  title: string;

  @Field(() => String, { description: 'Slug of the workshop' })
  slug: string;

  @Field(() => String, {
    description: 'Body SEO of the workshop',
    nullable: true,
  })
  seobody: string;

  @Field(() => String, {
    description: 'Title SEO of the workshop',
    nullable: true,
  })
  seotitle: string;

  @Field(() => String, {
    description: 'Description of the workshop',
    nullable: true,
  })
  body: string;

  @Field(() => Number, {
    description: 'Price of the workshop',
    nullable: true,
  })
  price: number;

  @Field(() => [Number], {
    description: 'User of the Workshop',
    nullable: true,
  })
  lecturers: [User];

  @Field(() => GraphQLUpload, {
    description: 'Image of the Hall',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Boolean, { description: 'Is workshop featured' })
  featured: boolean;

  @Field(() => Number, {
    description: 'Capacity of workshop',
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

  @Field(() => Number, { description: 'Hall of the workshop', nullable: true })
  hall: Hall;

  @Field(() => Boolean, {
    description: 'Status of the workshop',
    nullable: true,
  })
  status: boolean;

  @Field(() => String, {
    description: 'State of the workshop',
    nullable: true,
    defaultValue: 'not_started',
  })
  state: 'not_started' | 'running' | 'ended' | 'canceled';
}
