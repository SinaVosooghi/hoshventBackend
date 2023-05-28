import { Field, ObjectType } from '@nestjs/graphql';
import { Contact } from './contact.entity';

@ObjectType()
export class ContactPaginate {
  @Field(() => [Contact], { nullable: true })
  contacts: [Contact];
  @Field(() => Number)
  count: number;
}
