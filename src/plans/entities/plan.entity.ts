import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from 'src/events/entities/event.entity';

@ObjectType()
@Entity()
export class Plan {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the plan' })
  id: number;

  @Column()
  @Field(() => String, { description: 'title of the plan' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'body of the plan' })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the plan', nullable: true })
  image: string;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Price of the plan', nullable: true })
  price: number;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Sms of the plan', nullable: true })
  sms: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => User, { description: 'Author of the plan', nullable: true })
  user: User;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of the plan' })
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
