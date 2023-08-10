import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { RolesProperties } from './roles.interface';
import { User } from 'src/users/entities/user.entity';
import { Site } from 'src/sites/entities/site.entity';

@ObjectType()
export class PermissionObjectType {
  @Field(() => String, { nullable: true })
  key: string;

  @Field(() => Boolean, { nullable: true })
  value: boolean;
}

@ObjectType()
export class PermissionType {
  @Field(() => [PermissionObjectType], { nullable: true })
  read: [PermissionObjectType];

  @Field(() => [PermissionObjectType], { nullable: true })
  create: [PermissionObjectType];

  @Field(() => [PermissionObjectType], { nullable: true })
  update: [PermissionObjectType];

  @Field(() => [PermissionObjectType], { nullable: true })
  delete: [PermissionObjectType];
}

@ObjectType()
@Entity()
export class Role {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the role' })
  id: number;

  @Column()
  @Field(() => String, { description: 'first name of the role' })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'last name of the role', nullable: true })
  body: string;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'status of the coupon', nullable: true })
  status: boolean;

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

  @OneToMany(() => User, (user) => user.role, { nullable: true })
  @Field(() => [User], { description: 'User of role', nullable: true })
  users: User[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @Field(() => PermissionType, { nullable: true })
  public permissions: RolesProperties;
}
