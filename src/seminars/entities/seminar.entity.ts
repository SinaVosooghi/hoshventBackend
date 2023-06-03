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
export class Seminar {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the seminar' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the seminar' })
  title: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Slug of the seminar' })
  slug: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Body SEO of the seminar',
    nullable: true,
  })
  seobody: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Title SEO of the seminar',
    nullable: true,
  })
  seotitle: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the seminar',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Price of the seminar',
    nullable: true,
  })
  price: number;

  @ManyToMany(() => User)
  @JoinTable()
  @Field(() => [User], { description: 'User of the Seminar', nullable: true })
  lecturers: User[];

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the seminar', nullable: true })
  image: string;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Is seminar featured' })
  featured: boolean;

  @Column({ default: 0 })
  @Field(() => Number, {
    description: 'Capacity of workshop',
    nullable: true,
    defaultValue: 0,
  })
  capacity: number;

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'Startdate of event',
    nullable: true,
  })
  start_date: Date;

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'End date of event',
    nullable: true,
  })
  end_date: Date;

  @ManyToOne(() => Event, (event) => event.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => Event, { description: 'Event of the seminar', nullable: true })
  event: Event;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'User of the seminar', nullable: true })
  user: User;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the seminar',
  })
  status: boolean;

  @Column({ default: 'not_started' })
  @Field(() => String, {
    description: 'State of the seminar',
  })
  state: 'not_started' | 'running' | 'ended' | 'canceled';

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

  @BeforeInsert()
  generateSlug() {
    this.slug =
      slugify(this.title, {
        replacement: '-',
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      }) +
      '-' +
      Math.floor(Math.random() * 10) +
      1;
  }
}
