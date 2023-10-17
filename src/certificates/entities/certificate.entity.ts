import { ObjectType, Field, Int } from '@nestjs/graphql';
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
export class Certificate {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the Brand' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the Site' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  itemLayout: string;

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of the plan' })
  status: boolean;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the course', nullable: true })
  image: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Level of the user', nullable: true })
  type: 'seminar' | 'workshop';

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
