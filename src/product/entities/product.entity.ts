import { ObjectType, Field } from '@nestjs/graphql';
import { Category } from 'src/categories/entities/category.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import slugify from 'slugify';
import { Site } from 'src/sites/entities/site.entity';

@ObjectType()
export class VariationType {
  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  value: string;
}

@ObjectType()
export class ProductVariationType {
  @Field(() => Number, { nullable: true })
  idx: number;

  @Field(() => VariationType, { nullable: true })
  variation: VariationType;

  @Field(() => String, { nullable: true })
  value: string;
}

@ObjectType()
@Entity()
export class Product {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the product' })
  id: number;

  @Column()
  @Field(() => String, { description: 'title of the product' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'body of the product', nullable: true })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Body SEO of the product',
    nullable: true,
  })
  seobody: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Title SEO of the product',
    nullable: true,
  })
  seotitle: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Slug of the product' })
  slug: string;

  @Column('simple-array', { nullable: true })
  @Field(() => [String], {
    description: 'Image of the product',
    nullable: true,
  })
  image: string[];

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Price of the product', nullable: true })
  price: number;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Quantity of the product',
    nullable: true,
  })
  quantity: number;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Off Price of the product',
    nullable: true,
  })
  offprice: number;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Is product featured' })
  featured: boolean;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of product' })
  status: boolean;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Enable comments of product' })
  hascomment: boolean;

  @ManyToOne(() => Category, (category) => category.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Category, { description: 'Category of the product' })
  category: Category;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @Field(() => [ProductVariationType], { nullable: true })
  variations: [ProductVariationType];

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

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;

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
