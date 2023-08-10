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
export class Coupon {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the coupon' })
  id: number;

  @Column()
  @Field(() => String, { description: 'title of the coupon' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'description of the coupon',
    nullable: true,
  })
  body: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Code of the coupon' })
  code: string;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'percent of the coupon', nullable: true })
  percent: number;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'limit of the coupon', nullable: true })
  limit: number;

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'expire date of the coupon',
    nullable: true,
  })
  expiredate: Date;

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'start date of the coupon',
    nullable: true,
  })
  startdate: Date;

  @Column()
  @Field(() => Boolean, { description: 'status of the coupon' })
  status: boolean;

  @Column()
  @Field(() => String, { description: 'Type of the coupon' })
  type: 'shop' | 'course';

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
