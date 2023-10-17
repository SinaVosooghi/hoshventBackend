import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateCertificateInput } from './dto/create-certificate.input';
import { GetCertificatesArgs } from './dto/get-items.args';
import { UpdateCertificateInput } from './dto/update-certificate.input';
import { Certificate } from './entities/certificate.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async create(
    createCertificateInput: CreateCertificateInput,
    user: User,
  ): Promise<Certificate> {
    let image = null;
    if (createCertificateInput.image) {
      const imageUpload = await imageUploader(createCertificateInput.image);
      image = imageUpload.image;
    }

    const item = await this.certificateRepository.create({
      ...createCertificateInput,
      image,
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      return await this.certificateRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({
    skip,
    limit,
    searchTerm,
    status,
    site,
  }: GetCertificatesArgs) {
    const [result, total] = await this.certificateRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(status && { status: status }),
        ...(site && { site: { id: parseInt(site) } }),
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { certificates: result, count: total };
  }

  async findOne(id: number): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: id },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate #${id} not found`);
    }
    return certificate;
  }

  async getOne(type: 'seminar' | 'workshop', user: User): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { type, site: { id: user.site.id }, status: true },
      order: {
        id: 'DESC',
      },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate #${type} not found`);
    }
    return certificate;
  }

  async update(
    id: number,
    updateCertificateInput: UpdateCertificateInput,
  ): Promise<Certificate> {
    let image = null;
    if (updateCertificateInput.image) {
      const imageUpload = await imageUploader(updateCertificateInput.image);
      image = imageUpload.image;
    }

    const certificate = await this.certificateRepository
      .createQueryBuilder('certificate')
      .update({ ...updateCertificateInput, ...(image && { image: image }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!certificate) {
      throw new NotFoundException(`Certificate #${id} not found`);
    }
    return certificate.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const certificate = await this.certificateRepository.findOneBy({ id: id });

    await this.certificateRepository.remove(certificate);
    return true;
  }
}
