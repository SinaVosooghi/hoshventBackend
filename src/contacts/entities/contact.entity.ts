import { ObjectType, Field } from '@nestjs/graphql';
import { Site } from 'src/sites/entities/site.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Contact {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the blog' })
  id: number;

  @Field(() => String, { nullable: true })
  @Column()
  body: string;

  @Field(() => String, { nullable: true })
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  subject: string;

  @Field(() => String, { nullable: true })
  @Column({ default: true })
  email: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @Field(() => Date, { nullable: true })
  created: Date;

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
