import { ObjectType, Field } from '@nestjs/graphql';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Print {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number)
  id: number;

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    nullable: true,
  })
  site: Site;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => User, {
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
}
