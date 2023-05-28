import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { FileUpload } from 'src/events/dto/create-event.input';
import { Event } from 'src/events/entities/event.entity';
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
    description: 'Image of the Event',
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

  @Field(() => Number, { description: 'Event of the workshop', nullable: true })
  event: Event;

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
