import { Field, InputType } from '@nestjs/graphql';
import { Site, registerFieldsType } from 'src/sites/entities/site.entity';

import { Category } from 'src/categories/entities/category.entity';
import { GraphQLJSONObject } from 'graphql-type-json';
import { GraphQLUpload } from 'graphql-upload';
import { Role } from 'src/roles/entities/role.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Stream } from 'stream';
import { Workshop } from 'src/workshops/entities/workshop.entity';

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

  @Field(() => String, {
    description: 'first name of the user',
    nullable: true,
  })
  firstNameen?: string;

  @Field(() => String, { description: 'last name of the user', nullable: true })
  lastNameen?: string;

  @Field(() => String, { description: 'email of the user' })
  email: string;

  @Field(() => String, { description: 'address of the user', nullable: true })
  address: string;

  @Field(() => String, {
    description: 'Postalcode of the user',
    nullable: true,
  })
  postalcode: string;

  @Field(() => String, {
    description: 'Natinal code of the user',
    nullable: true,
  })
  nationalcode: string;

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

  @Field(() => Number, { description: 'Category of the user', nullable: true })
  category?: Category;

  @Field(() => GraphQLUpload, {
    description: 'Image of the Event',
    nullable: true,
  })
  avatar?: Promise<FileUpload>;

  @Field(() => String, {
    description: 'Image of the user',
    nullable: true,
  })
  avatarImage?: string;

  @Field(() => String, { description: 'type of the user' })
  usertype: 'super' | 'tenant' | 'instructor' | 'user' | 'lecturer' | 'guest';

  @Field(() => String, { description: 'Level of the user', nullable: true })
  level?: 'county' | 'city' | 'provice' | 'area' | 'all';

  @Field(() => Number, {
    description: 'Site of the user',
    nullable: true,
  })
  siteid?: Site;

  @Field(() => [Number], {
    nullable: true,
  })
  seminars?: [Seminar];

  @Field(() => [Number], {
    nullable: true,
  })
  workshops?: [Workshop];

  @Field(() => [Number], {
    nullable: true,
  })
  services?: [Workshop];

  @Field(() => GraphQLJSONObject, { nullable: true })
  registerFields?: registerFieldsType;

  @Field(() => String, { nullable: true })
  gender?: 'male' | 'female';

  @Field(() => String, { description: 'Title of the user', nullable: true })
  title?: string;

  @Field(() => String, { description: 'Title of the user', nullable: true })
  titleen?: string;
}
