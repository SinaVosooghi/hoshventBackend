import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from 'src/sites/entities/site.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';

@ObjectType()
@Entity()
export class Hall {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the hall' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the hall' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the hall',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the hall', nullable: true })
  image: string;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Is hall featured' })
  featured: boolean;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'User of the hall', nullable: true })
  user: User;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the hall',
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

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;

  @OneToMany(() => Seminar, (seminar) => seminar.hall, { nullable: true })
  @Field(() => [Seminar], { nullable: true })
  seminars: Seminar[];

  @OneToMany(() => Workshop, (workshop) => workshop.hall, { nullable: true })
  @Field(() => [Workshop], { nullable: true })
  workshops: Workshop[];
}
