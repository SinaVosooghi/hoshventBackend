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

  @Field(() => GraphQLUpload, {
    description: 'Image of the Service',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Boolean, { description: 'Status of the Service' })
  status: boolean;

  @Field(() => [Number], {
    description: 'Events of the services',
    nullable: true,
  })
  events: [Event];
}
