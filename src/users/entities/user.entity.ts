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
import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from 'src/roles/entities/role.entity';
import { Site } from 'src/sites/entities/site.entity';
import { Category } from 'src/categories/entities/category.entity';

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the user' })
  id: number;

  @Column({ unique: true, nullable: true })
  @Field(() => String, { description: 'Username of the user', nullable: true })
  username: string;

  @Column({ unique: true, nullable: true, type: 'bigint' })
  @Field(() => Number, { description: 'Mobilenumber of the user' })
  mobilenumber: number;

  @Column({ nullable: true, type: 'bigint' })
  @Field(() => Number, {
    description: 'Phonenumber of the user',
    nullable: true,
  })
  phonenumber?: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Password of the user' })
  password: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'About of the user', nullable: true })
  about: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Token of the user' })
  accesstoken: string;

  @Column()
  @Field(() => String, { description: 'First name of the user' })
  firstName: string;

  @Column()
  @Field(() => String, { description: 'Last name of the user' })
  lastName: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Email of the user' })
  email: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Avatar of the user', nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Address of the user', nullable: true })
  address: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'postalcode of the user',
    nullable: true,
  })
  postalcode: string;

  @ManyToOne(() => Category, (category) => category.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Category, {
    description: 'Category of the user',
    nullable: true,
  })
  category: Category;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Status of the user', nullable: true })
  status: boolean;

  @Column({ default: 'user', nullable: true })
  @Field(() => String, { description: 'Type of the user', nullable: true })
  usertype: 'super' | 'merchant' | 'instructor' | 'user' | 'lecturer';

  @Column({ nullable: true })
  @Field(() => String, { description: 'Level of the user', nullable: true })
  level: 'county' | 'city' | 'provice' | 'area' | 'all';

  @ManyToOne(() => Role, (role) => role.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => Role, { description: 'Role of the user', nullable: true })
  role: Role;

  @OneToMany(() => Site, (site) => site.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => Site, {
    description: 'Site of the user',
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
