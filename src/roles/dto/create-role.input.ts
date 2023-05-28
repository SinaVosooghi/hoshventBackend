import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { RolesProperties } from '../entities/roles.interface';

@InputType()
export class CreateRoleInput {
  @Field(() => String, { description: 'Title field (placeholder)' })
  title: string;

  @Field(() => String, { nullable: true })
  body: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  permissions?: RolesProperties;
}
