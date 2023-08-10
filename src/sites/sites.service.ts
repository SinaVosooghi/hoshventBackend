import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSiteInput } from './dto/create-site.input';
import { UpdateSiteInput } from './dto/update-site.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { Like, Repository } from 'typeorm';
import { GetSitesArgs } from './dto/get-items';
import { UsersService } from 'src/users/users.service';
import { imageUploader } from 'src/utils/imageUploader';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    private readonly userService: UsersService,
  ) {}

  async create(createSiteInput: CreateSiteInput): Promise<Site> {
    let logo = null;
    if (createSiteInput.logo) {
      const imageUpload = await imageUploader(createSiteInput.logo);
      logo = imageUpload.image;
    }

    const item = await this.siteRepository.create({ ...createSiteInput, logo });

    try {
      return await this.siteRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, status, type }: GetSitesArgs) {
    const [result, total] = await this.siteRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(type && { type: type }),
        status: status,
      },
      relations: ['category', 'user', 'plan'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { sites: result, count: total };
  }

  async findOne(id: number): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: { id: id },
      relations: ['category', 'user', 'plan'],
    });
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }

  async getSite(id: number): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: { id: id },
    });
    if (!site) {
      throw new NotFoundException(`Site #${id} not found`);
    }
    return site;
  }

  async update(id: number, updateSiteInput: UpdateSiteInput): Promise<Site> {
    let logo = null;
    if (updateSiteInput.logo) {
      const imageUpload = await imageUploader(updateSiteInput.logo);
      logo = imageUpload.image;
    }

    const site = await this.siteRepository
      .createQueryBuilder('site')
      .update({ ...updateSiteInput, ...(logo && { logo: logo }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!site) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return site.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const site = await this.siteRepository.findOneBy({ id: id });

    await this.siteRepository.remove(site);
    return true;
  }
}
