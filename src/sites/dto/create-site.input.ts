import { InputType, Field } from '@nestjs/graphql';
import { Category } from 'src/categories/entities/category.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { User } from 'src/users/entities/user.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateSiteInput {
  @Field(() => String, { description: 'Title of the Site' })
  title: string;

  @Field(() => String, { description: 'Email of the Site', nullable: true })
  email: string;

  @Field(() => String, {
    description: 'Company name of the Site',
    nullable: true,
  })
  company: string;

  @Field({ nullable: true })
  tax: number;

  @Field(() => String, {
    description: 'Phonenumber of website',
    nullable: true,
  })
  phonenumber: string;

  @Field(() => String, {
    description: 'Address of website',
    nullable: true,
  })
  address: string;

  @Field(() => String, {
    description: 'City of website',
    nullable: true,
  })
  city: string;

  @Field(() => String, {
    description: 'Country of website',
    nullable: true,
  })
  country: string;

  @Field(() => String, {
    description: 'Language of website',
    nullable: true,
  })
  language: string;

  @Field(() => String, {
    description: 'Timezone of website',
    nullable: true,
  })
  timezone: string;

  @Field(() => String, {
    description: 'Zipcode of website',
    nullable: true,
  })
  zipcode: string;

  @Field(() => String, { description: 'Domain of the Site', nullable: true })
  domain: string;

  @Field(() => String, { description: 'Domain of the Site', nullable: true })
  cardnumber: string;

  @Field(() => String, { description: 'Domain of the Site', nullable: true })
  sheba: string;

  @Field(() => String, { description: 'Slug of the Site' })
  slug: string;

  @Field(() => String, {
    description: 'Body SEO of the Site',
    nullable: true,
  })
  seobody: string;

  @Field(() => String, {
    description: 'Title SEO of the Site',
    nullable: true,
  })
  seotitle: string;

  @Field(() => String, {
    description: 'Description of the Site',
    nullable: true,
  })
  body: string;

  @Field(() => GraphQLUpload, {
    description: 'Logo of the site',
    nullable: true,
  })
  logo: Promise<FileUpload>;

  @Field(() => Number, {
    description: 'Category of the Site',
    nullable: true,
  })
  category: Category;

  @Field(() => Number, {
    description: 'Plan of the Site',
    nullable: true,
  })
  plan: Plan;

  @Field(() => String, {
    description: 'Type of the Site',
  })
  type: 'internal' | 'external';

  @Field(() => Boolean, {
    description: 'Status of the Site',
    nullable: true,
  })
  status: boolean;

  @Field(() => Number, { nullable: true })
  user: User;
}
