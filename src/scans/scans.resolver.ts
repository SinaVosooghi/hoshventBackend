import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ScansService } from './scans.service';
import { Scan } from './entities/scan.entity';
import { CreateScanInput } from './dto/create-scan.input';
import { UpdateScanInput } from './dto/update-scan.input';
import { ScanPaginate } from './entities/paginate';
import { GetScansArgs } from './dto/get-scans.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Scan)
export class ScansResolver {
  constructor(private readonly scansService: ScansService) {}

  @Mutation(() => Scan)
  @UseGuards(GqlAuthGuard)
  createScan(@Args('input') createScanInput: CreateScanInput) {
    return this.scansService.create(createScanInput);
  }

  @Query(() => ScanPaginate, { name: 'scans' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getScansArgs: GetScansArgs,
    @CurrentUser() user: User,
  ) {
    return this.scansService.findAll(getScansArgs, user);
  }

  @Query(() => Scan, { name: 'scan' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.scansService.findOne(id);
  }

  @Mutation(() => Scan)
  @UseGuards(GqlAuthGuard)
  updateScan(@Args('input') updateScanInput: UpdateScanInput) {
    return this.scansService.update(updateScanInput.id, updateScanInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeScan(@Args('id', { type: () => Int }) id: number) {
    return this.scansService.remove(id);
  }

  @Query(() => String, { name: 'scansPdf' })
  @UseGuards(GqlAuthGuard)
  usersPdf(
    @Args('input') getUsersApiArgs: GetScansArgs,
    @CurrentUser() user: User,
  ) {
    return this.scansService.getPdf(getUsersApiArgs, user);
  }
}
