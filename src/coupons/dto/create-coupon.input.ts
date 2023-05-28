import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCouponInput {
  @Field(() => String, { description: 'title of the coupon' })
  title: string;

  @Field(() => String, {
    description: 'description of the coupon',
    nullable: true,
  })
  body: string;

  @Field(() => String, { description: 'Code of the coupon' })
  code: string;

  @Field(() => Number, { description: 'percent of the coupon', nullable: true })
  percent: number;

  @Field(() => Number, { description: 'limit of the coupon', nullable: true })
  limit: number;

  @Field(() => Date, {
    description: 'expire date of the coupon',
    nullable: true,
  })
  expiredate: Date;

  @Field(() => Date, {
    description: 'start date of the coupon',
    nullable: true,
  })
  startdate: Date;

  @Field(() => Boolean, { description: 'status of the coupon' })
  status: boolean;

  @Field(() => String, { description: 'Type of the coupon' })
  type: 'shop' | 'course';
}
