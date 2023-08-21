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
import { writeFile, cp } from 'fs';
import { exec } from 'child_process';

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

    if (createSiteInput.port === 4040) throw new Error('Port already exist');
    if (createSiteInput.port === 3030) throw new Error('Port already exist');
    if (createSiteInput.port === 3000) throw new Error('Port already exist');
    if (createSiteInput.port === 9000) throw new Error('Port already exist');
    if (createSiteInput.port === 5432) throw new Error('Port already exist');
    if (createSiteInput.port === 80) throw new Error('Port already exist');
    if (createSiteInput.port === 443) throw new Error('Port already exist');

    await writeFile(
      `/etc/nginx/sites-available/${item.domain}.conf`,
      `
    server {
        server_name ${item.domain}.conf;
        root /var/www/front/.next;
    
        listen 80;
    
        index index.html index.htm index.php;
    
        location / {
            proxy_pass http://146.19.212.55:${item.port};
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    `,
      (err) => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      },
    );

    const src = `/var/www/tenant`;
    const dist = `/var/www/${item.domain}`;

    await cp(src, dist, { recursive: true }, async (e) => {
      console.log('Error CP: ', e);
      await writeFile(
        `/var/www/${item.domain}/.env.local`,
        `
        NEXT_PUBLIC_BASE_API=https://api.hoshvent.com/graphql
        NEXT_PUBLIC_SITE_URL=https://api.hoshvent.com
        NODE_ENV="production"
        NEXT_PUBLIC_UPLOAD_MULTIPLE_API=https://hoshvent.com/multiple
        NEXT_PUBLIC_UPLOAD_VIDEO_API=https://hoshvent.com/video
        NEXT_PUBLIC_SITE=https://hoshvent.com
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
        
        NEXT_PUBLIC_JITSI_API_KEY=""
        NEXT_PUBLIC_JITSI_APP_ID=""
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
        NEXT_PUBLIC_SITE=${item.id}
        
      `,
        (err) => {
          if (err) {
            console.error(err);
          }
          console.log('ENV Created');
          // file written successfully
        },
      );
    });

    await exec(`cd ${dist} && yarn run build`);

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
