import { ObjectType, Field } from '@nestjs/graphql';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Comment {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the Comment' })
  id: number;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn()
  @Field(() => User, { description: 'User of the Comment', nullable: true })
  user: User;

  // @OneToMany(() => Review, (review) => review.id, { nullable: true })
  // @JoinColumn()
  // @Field(() => Review, { description: 'Review of the Comment', nullable: true })
  // review: Review;

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;

  @Column()
  @Field(() => String, { description: 'title of the Comment' })
  body: string;

  @Column()
  @Field(() => Boolean, { description: 'status of the Comment' })
  status: boolean;

  @ManyToOne(() => Comment, (comment) => comment.id, { nullable: true })
  @JoinColumn()
  @Field(() => Comment, {
    description: 'Comment of the Comment',
    nullable: true,
  })
  comments: [Comment];

  // @OneToMany(() => Like, (like) => like.id, { nullable: true })
  // @JoinColumn()
  // @Field(() => Comment, {
  //   description: 'Comment of the Comment',
  //   nullable: true,
  // })
  // like: [Like];

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
