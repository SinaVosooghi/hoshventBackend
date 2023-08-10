import { ObjectType, Field } from '@nestjs/graphql';
import { Chat } from 'src/chats/entities/chat.entity';
import { Site } from 'src/sites/entities/site.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Department {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the Category' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Title of the Category' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Description of the Category',
    nullable: true,
  })
  body: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Image of the course', nullable: true })
  image: string;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Status of the category',
    nullable: true,
  })
  status: boolean;

  @OneToMany(() => Chat, (chat) => chat.department, {
    nullable: true,
  })
  @Field(() => [Chat], {
    description: 'Chats user of the department',
    nullable: true,
  })
  chats: Chat[];

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
}
