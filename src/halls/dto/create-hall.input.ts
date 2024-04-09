import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { FileUpload } from 'src/events/dto/create-event.input';
import { Site } from 'src/sites/entities/site.entity';

@InputType()
export class CreateHallInput {
  @Field(() => String, { description: 'Title of the hall' })
  title: string;

  @Field(() => String, {
    description: 'Description of the hall',
    nullable: true,
  })
  body: string;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Hall',
    nullable: true,
  })
  image: Promise<FileUpload>;

  @Field(() => Boolean, { description: 'Is hall featured' })
  featured: boolean;

  @Field(() => Number, { description: 'Site of the hall', nullable: true })
  site: Site;

  @Field(() => Boolean, {
    description: 'Status of the hall',
    nullable: true,
  })
  status: boolean;
}
export { FileUpload };
