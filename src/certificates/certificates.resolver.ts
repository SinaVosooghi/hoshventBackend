import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CertificatesService } from './certificates.service';
import { Certificate } from './entities/certificate.entity';
import { CreateCertificateInput } from './dto/create-certificate.input';
import { UpdateCertificateInput } from './dto/update-certificate.input';
import { CertificatePaginate } from './entities/paginate';
import { GetCertificatesArgs } from './dto/get-items.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Certificate)
export class CertificatesResolver {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Mutation(() => Certificate)
  @UseGuards(GqlAuthGuard)
  createCertificate(
    @Args('input') createCertificateInput: CreateCertificateInput,
    @CurrentUser() user: User,
  ) {
    return this.certificatesService.create(createCertificateInput, user);
  }

  @Query(() => CertificatePaginate, { name: 'certificates' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getCertificatesArgs: GetCertificatesArgs) {
    return this.certificatesService.findAll(getCertificatesArgs);
  }

  @Query(() => Certificate, { name: 'certificate' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.certificatesService.findOne(id);
  }

  @Mutation(() => Certificate)
  @UseGuards(GqlAuthGuard)
  updateCertificate(
    @Args('input') updateCertificateInput: UpdateCertificateInput,
  ) {
    return this.certificatesService.update(
      updateCertificateInput.id,
      updateCertificateInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeCertificate(@Args('id', { type: () => Int }) id: number) {
    return this.certificatesService.remove(id);
  }

  @Query(() => Certificate, { name: 'getCertificate' })
  @UseGuards(GqlAuthGuard)
  getOne(
    @Args('type', { type: () => String }) type: 'seminar' | 'workshop',
    @CurrentUser() user: User,
  ) {
    return this.certificatesService.getOne(type, user);
  }
}
