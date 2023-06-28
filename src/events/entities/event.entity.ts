import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import slugify from 'slugify';
import { Site } from 'src/sites/entities/site.entity';
import { Category } from 'src/categories/entities/category.entity';

@ObjectType()
@Entity()
export class Event {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the blog' })
  id: number;

  @Column()
  @Field(() => String, { description: 'title of the blog' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'body of the blog' })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the blog', nullable: true })
  image: string;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => User, { description: 'Author of the blog', nullable: true })
  user: User;

  @ManyToOne(() => Site, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => Site, { description: 'Author of the blog', nullable: true })
  site: Site;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Price of the seminar',
    nullable: true,
  })
  price: number;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'OFF Price of the seminar',
    nullable: true,
  })
  offprice: number;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'video of the seminar',
    nullable: true,
  })
  video: string;

  @ManyToOne(() => Category, (category) => category.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => Category, { description: 'Author of the blog', nullable: true })
  category: Category;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of the blog' })
  status: boolean;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Featured of the blog' })
  featured: boolean;

  @Column({ unique: true })
  @Field(() => String, { description: 'Slug of the blog' })
  slug: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Body SEO of the blog',
    nullable: true,
  })
  seobody: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Duration of the course',
    nullable: true,
  })
  duration: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Title SEO of the blog',
    nullable: true,
  })
  seotitle: string;

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

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Capacity of seminar',
    nullable: true,
  })
  capacity: number;

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
