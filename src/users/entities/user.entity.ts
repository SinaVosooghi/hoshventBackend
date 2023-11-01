import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from 'src/roles/entities/role.entity';
import { Site, registerFieldsType } from 'src/sites/entities/site.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Timeline } from 'src/timelines/entities/timeline.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Service } from 'src/services/entities/services.entity';

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the user' })
  id: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Username of the user', nullable: true })
  username: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  gender: 'male' | 'female';

  @Column({ nullable: true, type: 'bigint' })
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

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'First name of the user',
    nullable: true,
  })
  firstNameen: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Last name of the user', nullable: true })
  lastNameen: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Natinal code of the user' })
  nationalcode: string;

  @Column()
  @Field(() => String, { description: 'Email of the user' })
  email: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Avatar of the user', nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Title of the user', nullable: true })
  title?: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Title of the user', nullable: true })
  titleen?: string;

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
  usertype: 'super' | 'tenant' | 'instructor' | 'user' | 'lecturer' | 'guest';

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
  @Field(() => [Site], {
    description: 'Site of the user',
    nullable: true,
  })
  site: Site;

  @OneToMany(() => Timeline, (timeline) => timeline.scannedby, {
    nullable: true,
  })
  @Field(() => [Timeline], { description: 'Message of chats', nullable: true })
  timelines: Timeline[];

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the menu',
    nullable: true,
  })
  siteid: Site;

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

  @ManyToMany(() => Seminar)
  @JoinTable()
  @Field(() => [Seminar], {
    nullable: true,
  })
  seminars?: Seminar[];

  @ManyToMany(() => Workshop)
  @JoinTable()
  @Field(() => [Workshop], {
    nullable: true,
  })
  workshops?: Workshop[];

  @ManyToMany(() => Service)
  @JoinTable()
  @Field(() => [Service], {
    nullable: true,
  })
  services?: Service[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @Field(() => GraphQLJSONObject, { nullable: true })
  registerFields: registerFieldsType;
}
