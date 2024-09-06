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
import { Service } from 'src/services/entities/services.entity';

@ObjectType()
@Entity()
export class Attendee {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the attendee', nullable: true })
  id: number;

  @Column()
  @Field(() => Boolean, { description: 'Status of the attendee' })
  status: boolean;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => User, {
    description: 'Organizer of the attendee',
    nullable: true,
  })
  user: User;

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

  @ManyToOne(() => Service, (service) => service.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Service, {
    nullable: true,
  })
  service: Service;
}
