import { Field, ObjectType } from '@nestjs/graphql';
import { Scan } from './scan.entity';

@ObjectType()
export class ScanPaginate {
  @Field(() => [Scan], { nullable: true })
  scans: [Scan];
  @Field(() => Number)
  count: number;
}
