import { ObjectType, Field } from '@nestjs/graphql';
import { Category } from 'src/categories/entities/category.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Site {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the Site' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the Site' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Email of the Site', nullable: true })
  email: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Company name of the Site',
    nullable: true,
  })
  company: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Phonenumber of website',
    nullable: true,
  })
  phonenumber: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Address of website',
    nullable: true,
  })
  address: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'City of website',
    nullable: true,
  })
  city: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Country of website',
    nullable: true,
  })
  country: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Language of website',
    nullable: true,
  })
  language: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Timezone of website',
    nullable: true,
  })
  timezone: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Zipcode of website',
    nullable: true,
  })
  zipcode: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Domain of the Site', nullable: true })
  domain: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Domain of the Site', nullable: true })
  cardnumber: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Domain of the Site', nullable: true })
  sheba: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Slug of the Site' })
  slug: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Body SEO of the Site',
    nullable: true,
  })
  seobody: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Title SEO of the Site',
    nullable: true,
  })
  seotitle: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the Site',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Logo of the course', nullable: true })
  logo: string;

  @Column({ default: 'internal' })
  @Field(() => String, {
    description: 'Type of the Site',
  })
  type: 'internal' | 'external';

  @ManyToOne(() => Category, (category) => category.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Category, {
    description: 'category of the Site',
    nullable: true,
  })
  category: Category;

  @ManyToOne(() => Plan, (plan) => plan.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Plan, {
    description: 'category of the Site',
    nullable: true,
  })
  plan: Plan;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => User, {
    description: 'User of the site',
    nullable: true,
  })
  user: User;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the Site',
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
}
