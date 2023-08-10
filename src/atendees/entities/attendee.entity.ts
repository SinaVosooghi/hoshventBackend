import { ObjectType, Field } from '@nestjs/graphql';
import { Event } from 'src/events/entities/event.entity';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
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
export class Attendee {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the attendee', nullable: true })
  id: number;

  @Column()
  @Field(() => Boolean, { description: 'Status of the attendee' })
  status: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, {
    description: 'Organizer of the attendee',
    nullable: true,
  })
  user: User;

  @ManyToOne(() => Event, (event) => event.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Event, { nullable: true })
  event: Event;

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
