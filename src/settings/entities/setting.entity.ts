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
export class Setting {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the Setting' })
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  title: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  address: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  workinghours: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  keywords: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  email: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  logo_second: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  favicon: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  seodescription: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  about: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  tax: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  support: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  faq: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  copyright: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  policy: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  youtube: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  instagram: string;

  @Column({ nullable: true, default: false })
  @Field({ defaultValue: false, nullable: true })
  maintenance?: boolean;

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
