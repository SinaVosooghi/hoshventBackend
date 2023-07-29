import { ObjectType, Field } from '@nestjs/graphql';
import { Event } from 'src/events/entities/event.entity';
import slugify from 'slugify';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Hall {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the hall' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the hall' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the hall',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the hall', nullable: true })
  image: string;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Is hall featured' })
  featured: boolean;

  @ManyToOne(() => Event, (event) => event.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => Event, { description: 'Event of the hall', nullable: true })
  event: Event;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'User of the hall', nullable: true })
  user: User;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the hall',
  })
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
