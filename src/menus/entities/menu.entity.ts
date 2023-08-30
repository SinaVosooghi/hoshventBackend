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
export class Menu {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the menu' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the menu' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Link of the menu', nullable: true })
  link: string;

  @Column({ default: 0, nullable: true })
  @Field(() => Number, { nullable: true, defaultValue: 0 })
  order: number;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the menu',
    nullable: true,
  })
  status: boolean;

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the menu',
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
}
