import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { Event } from 'src/events/entities/event.entity';
import { Site } from 'src/sites/entities/site.entity';
import { Stream } from 'stream';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

@InputType()
export class CreateServiceInput {
  @Field(() => String, { description: 'title of the Service' })
  title: string;

  @Field(() => String, { description: 'body of the Service' })
  body: string;

  @Field(() => Number, { description: 'body of the Service', nullable: true })
  price: number;

  @Field(() => Number, {
    description: 'Quantity of the Service',
    nullable: true,
  })
  quantity: number;

  @Field(() => Number, {
    description: 'Per person of the service',
    nullable: true,
  })
  perperson: number;

  @Field(() => GraphQLUpload, {
    description: 'Image of the service',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Boolean, { description: 'Status of the Service' })
  status: boolean;

  @Field(() => [Number], {
    description: 'Events of the service',
    nullable: true,
  })
  events: [Event];

  @Field(() => Date, {
    description: 'Startdate of service',
    nullable: true,
  })
  start_date: Date;

  @Field(() => Date, {
    description: 'Enddate of service',
    nullable: true,
  })
  end_date: Date;
}
