import { ObjectType, Field } from '@nestjs/graphql';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinTable,
} from 'typeorm';

@ObjectType()
@Entity()
export class Timeline {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of slider' })
  id: number;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  checkin: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  checkout: Date;

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;

  @ManyToOne(() => Seminar, (seminar) => seminar.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Seminar, {
    description: 'Site of the item',
    nullable: true,
  })
  seminar: Seminar;

  @ManyToOne(() => Workshop, (workshop) => workshop.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Workshop, {
    description: 'Site of the item',
    nullable: true,
  })
  workshop: Workshop;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => User, { description: 'Author of the blog', nullable: true })
  user: User;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => User, { description: 'Author of the blog', nullable: true })
  scannedby: User;

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
