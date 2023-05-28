import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Shipping {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the order' })
  id: number;

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

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of the shipping' })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @Field(() => Date, { nullable: true })
  created: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    nullable: true,
  })
  @Field(() => Date, { nullable: true })
  updated: Date;
}
