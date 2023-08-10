import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
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
import { Event } from 'src/events/entities/event.entity';

@ObjectType()
@Entity()
export class Service {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the service' })
  id: number;

  @Column()
  @Field(() => String, { description: 'title of the service' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'body of the service' })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the service', nullable: true })
  image: string;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Price of the service', nullable: true })
  price: number;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Quantity of the service',
    nullable: true,
  })
  quantity: number;

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'Per person of the service',
    nullable: true,
  })
  perperson: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => User, { description: 'Author of the service', nullable: true })
  user: User;

  @ManyToMany(() => Event)
  @JoinTable()
  @Field(() => [Event], {
    description: 'Events of the service',
    nullable: true,
  })
  events: Event[];

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of the service' })
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

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'Startdate of service',
    nullable: true,
  })
  start_date: Date;

  @Column({ nullable: true })
  @Field(() => Date, {
    description: 'End date of service',
    nullable: true,
  })
  end_date: Date;
}
