import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { Category } from 'src/categories/entities/category.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Site } from 'src/sites/entities/site.entity';
import { Stream } from 'stream';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'first name of the user' })
  firstName: string;

  @Field(() => String, { description: 'last name of the user' })
  lastName: string;

  @Field(() => String, { description: 'email of the user' })
  email: string;

  @Field(() => String, { description: 'address of the user', nullable: true })
  address: string;

  @Field(() => String, {
    description: 'Postalcode of the user',
    nullable: true,
  })
  postalcode: string;

  @Field(() => Number, { description: 'role of the user', nullable: true })
  role: Role;

  @Field(() => String, { description: 'username of the user', nullable: true })
  username: string;

  @Field(() => String, { description: 'mobilenumber of the user' })
  password: string;

  @Field(() => String, { description: 'about of the user', nullable: true })
  about: string;

  @Field(() => Boolean, { description: 'status of the user', nullable: true })
  status: boolean;

  @Field(() => Number, { description: 'mobilenumber of the user' })
  mobilenumber: number;

  @Field(() => Number, {
    description: 'mobilenumber of the user',
    nullable: true,
  })
  phonenumber: number;

  @Field(() => Number, { description: 'Category of the user' })
  category?: Category;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Event',
    nullable: true,
  })
  avatar?: Promise<FileUpload>;

  @Field(() => String, { description: 'type of the user' })
  usertype: 'super' | 'merchant' | 'instructor' | 'user' | 'lecturer';

  @Field(() => String, { description: 'Level of the user', nullable: true })
  level?: 'county' | 'city' | 'provice' | 'area' | 'all';

  @Field(() => Number, {
    description: 'Site of the user',
    nullable: true,
  })
  site?: Site;
}
