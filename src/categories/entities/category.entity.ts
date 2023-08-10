import { ObjectType, Field } from '@nestjs/graphql';
import { Site } from 'src/sites/entities/site.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Category {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the Category' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the Category' })
  title: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Slug of the Category' })
  slug: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Body SEO of the Category',
    nullable: true,
  })
  seobody: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Title SEO of the Category',
    nullable: true,
  })
  seotitle: string;

  @Column()
  @Field(() => String, { description: 'Type of the Category' })
  type: 'site' | 'blog' | 'event' | 'user';

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the Category',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the course', nullable: true })
  image: string;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Is category featured' })
  featured: boolean;

  @OneToOne(() => Category, (category) => category.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => Category, {
    description: 'Category parent of the category',
    nullable: true,
  })
  category: Category;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the category',
    nullable: true,
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

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;
}
