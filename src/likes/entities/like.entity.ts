import { ObjectType, Field } from '@nestjs/graphql';
import { Blog } from 'src/blogs/entities/blog.entity';
import { Product } from 'src/product/entities/product.entity';
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
export class Like {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the Favorite' })
  id: number;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: ' User of the Favorite' })
  user: User;

  @ManyToOne(() => Blog, (blog) => blog.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Blog, {
    description: ' Course of the Favorite',
    nullable: true,
  })
  blog: Blog;

  @ManyToOne(() => Product, (product) => product.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Product, {
    description: ' User of the Favorite',
    nullable: true,
  })
  product: Product;

  @Column()
  @Field(() => Boolean, { description: 'like of the Like' }) // True is liked false is disliked
  like: boolean;

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
