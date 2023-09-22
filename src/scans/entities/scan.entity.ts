import { ObjectType, Field } from '@nestjs/graphql';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';
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
export class Scan {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number)
  id: number;

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

  @ManyToOne(() => Workshop, (workshop) => workshop.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Workshop, {
    nullable: true,
  })
  workshop: Workshop;

  @ManyToOne(() => Seminar, (seminar) => seminar.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Seminar, {
    nullable: true,
  })
  seminar: Seminar;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, {
    description: 'Organizer of the attendee',
    nullable: true,
  })
  scanby: User;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, {
    description: 'Organizer of the attendee',
    nullable: true,
  })
  user: User;

  @Column()
  @Field(() => String)
  type: 'checkin' | 'checkout';
}
