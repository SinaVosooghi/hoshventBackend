import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateLikeInput {
  @Field(() => Number, { description: 'Course of the Like', nullable: true })
  course: number;

  @Field(() => Number, { description: 'Product of the Like', nullable: true })
  product: number;

  @Field(() => Number, { description: 'Blog of the Like', nullable: true })
  blog: number;

  @Field(() => Boolean, { description: 'Like of the Like' })
  like: boolean;
}
