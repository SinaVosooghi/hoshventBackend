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
import * as fs from 'fs-extra';
import { UserDataInput } from './dto/user-data.input';
import * as path from 'path';

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

  @Query(() => String, { name: 'scanTotal' })
  @UseGuards(GqlAuthGuard)
  usersTotalTimesPdf(
    @Args('input') getUsersApiArgs: GetScansArgs,
    @CurrentUser() user: User,
  ) {
    return this.scansService.getTotalTimesPdf(getUsersApiArgs, user);
  }

  @Query(() => String)
  async generateBatchCardPdf(
    @Args('data', { type: () => [UserDataInput] }) data: UserDataInput[], // Ensure proper typing
  ): Promise<string> {
    const pdfBuffer = await this.scansService.generateBatchPdf(data);

    const rootDir = process.cwd();
    const filesDir = path.join(rootDir, 'files');

    // Ensure the "files" directory exists
    await fs.ensureDir(filesDir);

    // Define the file path inside the "files" directory
    const fileName = `${Date.now()}-card.pdf`;
    const filePath = path.join(filesDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);

    return `${process.env.API_ADDRESS}/${fileName}`;
  }
}
