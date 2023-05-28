import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Contact {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the blog' })
  id: number;

  @Field(() => String, { nullable: true })
  @Column()
  body: string;

  @Field(() => String, { nullable: true })
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  subject: string;

  @Field(() => String, { nullable: true })
  @Column({ default: true })
  email: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @Field(() => Date, { nullable: true })
  created: Date;
}
