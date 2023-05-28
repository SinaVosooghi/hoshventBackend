import { InputType, Int, Field } from '@nestjs/graphql';
import { Column } from 'typeorm';

@InputType()
export class CreateShippingInput {
  @Column()
  @Field(() => String, { description: 'Title of the shipping' })
  title: string;

  @Column()
  @Field(() => String, {
    description: 'Description of the shipping',
    nullable: true,
  })
  body: string;

  @Column()
  @Field(() => Number, { description: 'Cost of the shipping', nullable: true })
  cost: number;

  @Field(() => Boolean, { description: 'Status of the shipping' })
  status: boolean;
}
