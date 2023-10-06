import { ObjectType, Field } from '@nestjs/graphql';
import { Site } from 'src/sites/entities/site.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Brand {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the Brand' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the Brand' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the Brand',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the Brand',
    nullable: true,
  })
  link: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the course', nullable: true })
  image: string;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Is brand featured' })
  featured: boolean;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the brand',
    nullable: true,
  })
  status: boolean;

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
}
