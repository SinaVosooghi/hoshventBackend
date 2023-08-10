import { ObjectType, Field } from '@nestjs/graphql';
import { Hall } from 'src/halls/entities/hall.entity';
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
import { Site } from 'src/sites/entities/site.entity';

@ObjectType()
@Entity()
export class Seminar {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the workshop' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the workshop' })
  title: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Slug of the workshop' })
  slug: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Body SEO of the workshop',
    nullable: true,
  })
  seobody: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Title SEO of the workshop',
    nullable: true,
  })
  seotitle: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the workshop',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Price of the workshop',
    nullable: true,
  })
  price: number;

  @ManyToMany(() => User)
  @JoinTable()
  @Field(() => [User], { description: 'User of the Workshop', nullable: true })
  lecturers: User[];

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the workshop', nullable: true })
  image: string;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Is workshop featured' })
  featured: boolean;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Capacity of workshop',
    nullable: true,
  })
  capacity: number;

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'Startdate of workshop',
    nullable: true,
  })
  start_date: Date;

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'End date of workshop',
    nullable: true,
  })
  end_date: Date;

  @ManyToOne(() => Hall, (hall) => hall.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => Hall, { description: 'Hall of the workshop', nullable: true })
  hall: Hall;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'User of the workshop', nullable: true })
  user: User;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the workshop',
  })
  status: boolean;

  @Column({ default: 'not_started' })
  @Field(() => String, {
    description: 'State of the workshop',
    defaultValue: 'not_started',
    nullable: true,
  })
  state: 'not_started' | 'running' | 'ended' | 'canceled';

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;

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
