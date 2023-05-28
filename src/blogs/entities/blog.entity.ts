import { ObjectType, Field } from '@nestjs/graphql';
import { Category } from 'src/categories/entities/category.entity';
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

@ObjectType()
@Entity()
export class Blog {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the blog' })
  id: number;

  @Column()
  @Field(() => String, { description: 'title of the blog' })
  title: string;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Read time of the blog', nullable: true })
  readtime: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'body of the blog' })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the blog', nullable: true })
  image: string;

  @ManyToOne(() => Category, (category) => category.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Category, {
    description: 'Category of the blog',
    nullable: true,
  })
  category: Category;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => User, { description: 'Author of the blog', nullable: true })
  author: User;

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
    description: 'Title SEO of the blog',
    nullable: true,
  })
  seotitle: string;

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
