import { ObjectType, Field } from '@nestjs/graphql';
import { Service } from 'src/services/entities/services.entity';
import { Site } from 'src/sites/entities/site.entity';
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

@ObjectType()
@Entity()
export class Plan {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the plan' })
  id: number;

  @Column()
  @Field(() => String, { description: 'title of the plan' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Subtitle of the plan', nullable: true })
  subtitle: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Slug of the plan' })
  slug: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'body of the plan', nullable: true })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the plan', nullable: true })
  image: string;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Price of the plan', nullable: true })
  price: number;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Sms of the plan', nullable: true })
  sms: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  @Field(() => User, { description: 'Author of the plan', nullable: true })
  user: User;

  @ManyToMany(() => Service)
  @JoinTable()
  @Field(() => [Service], {
    description: 'Service of plan',
    nullable: true,
  })
  services: Service[];

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of the plan' })
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
