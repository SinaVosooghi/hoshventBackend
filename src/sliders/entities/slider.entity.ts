import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';

@ObjectType()
@Entity()
export class Slider {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of slider' })
  id: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  body: string;

  @Column({ nullable: true })
  @Field(() => String)
  link: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  alt: string;

  @Column()
  @Field(() => Boolean)
  status: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  featured: boolean;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  image: string;

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
