import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { FileUpload } from 'src/halls/dto/create-hall.input';
import { Hall } from 'src/halls/entities/hall.entity';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateSeminarInput {
  @Field(() => String, { description: 'Title of the seminar' })
  title: string;

  @Field(() => String, { description: 'Slug of the seminar' })
  slug: string;

  @Field(() => String, {
    description: 'Body SEO of the seminar',
    nullable: true,
  })
  seobody: string;

  @Field(() => String, {
    description: 'Title SEO of the seminar',
    nullable: true,
  })
  seotitle: string;

  @Field(() => String, {
    description: 'Description of the seminar',
    nullable: true,
  })
  body: string;

  @Field(() => Number, {
    description: 'Price of the seminar',
    nullable: true,
  })
  price: number;

  @Field(() => [Number], {
    description: 'User of the Seminar',
    nullable: true,
  })
  lecturers: [User];

  @Field(() => GraphQLUpload, {
    description: 'Image of the Seminar',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Boolean, { description: 'Is seminar featured' })
  featured: boolean;

  @Field(() => Number, {
    description: 'Capacity of Seminar',
    nullable: true,
  })
  capacity: number;

  @Field(() => Date, {
    description: 'Startdate of Seminar',
    nullable: true,
  })
  start_date: Date;

  @Field(() => Date, {
    description: 'Enddate of Seminar',
    nullable: true,
  })
  end_date: Date;

  @Field(() => Number, { description: 'Hall of the seminar', nullable: true })
  hall: Hall;

  @Field(() => Boolean, {
    description: 'Status of the seminar',
    nullable: true,
  })
  status: boolean;

  @Field(() => String, {
    description: 'State of the seminar',
    nullable: true,
    defaultValue: 'not_started',
  })
  state: 'not_started' | 'running' | 'ended' | 'canceled';
}
