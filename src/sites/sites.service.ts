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
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  async create(createSiteInput: CreateSiteInput): Promise<Site> {
    let logo = null;
    let banner = null;

    if (createSiteInput.logo) {
      const imageUpload = await imageUploader(createSiteInput.logo);
      logo = imageUpload.image;
    }

    if (createSiteInput.banner) {
      const imageUpload = await imageUploader(createSiteInput.banner);
      banner = imageUpload.image;
    }

    const item = await this.siteRepository.create({
      ...createSiteInput,
      logo,
      banner,
    });

    if (createSiteInput.port === 4040) throw new Error('Port already exist');
    if (createSiteInput.port === 3030) throw new Error('Port already exist');
    if (createSiteInput.port === 3000) throw new Error('Port already exist');
    if (createSiteInput.port === 9000) throw new Error('Port already exist');
    if (createSiteInput.port === 5432) throw new Error('Port already exist');
    if (createSiteInput.port === 80) throw new Error('Port already exist');
    if (createSiteInput.port === 443) throw new Error('Port already exist');

    if (process.env.NODE_ENV === 'production') {
      await writeFile(
        `/etc/nginx/sites-available/${item.domain}.conf`,
        `
      server {
          server_name ${item.domain};
          root /var/www/front/.next;
      
          listen 80;
      
          index index.html index.htm index.php;
      
          location / {
              proxy_pass http://localhost:${item.port};
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
          console.log('VHOST Built');
          // file written successfully
        },
      );

      const src = `/var/www/tenant`;
      const dist = `/var/www/${item.domain}`;

      exec(`cp -r ${src} ${dist}`, async (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
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
          async (err) => {
            if (err) {
              console.error(err);
            }
            console.log('ENV Created');

            await writeFile(
              `/var/www/${item.domain}/package.json`,
              `{
                "name": "event-fronts",
                "version": "0.1.0",
                "private": true,
                "scripts": {
                  "dev": "next dev -p ${item.port}",
                  "build": "next build",
                  "start": "next start -p ${item.port}",
                  "lint": "next lint"
                },
                "dependencies": {
                  "@ant-design/icons": "^5.0.1",
                  "@apollo/client": "^3.7.4",
                  "@devmehq/react-qr-code": "^1.0.9",
                  "@fullcalendar/core": "^6.1.8",
                  "@fullcalendar/daygrid": "^6.1.8",
                  "@fullcalendar/react": "^6.1.8",
                  "@jitsi/react-sdk": "^1.3.0",
                  "@next/bundle-analyzer": "^13.4.7",
                  "@next/font": "^13.1.2",
                  "@rematch/core": "^2.2.0",
                  "@stripe/react-stripe-js": "^2.1.0",
                  "@stripe/stripe-js": "^1.52.1",
                  "antd": "^5.6.0",
                  "axios": "^1.2.2",
                  "chop-lines": "^1.15.7",
                  "cookies-next": "^2.1.1",
                  "graphql": "^16.6.0",
                  "html-react-parser": "^3.0.12",
                  "insane": "^2.6.2",
                  "jalali-moment": "^3.3.11",
                  "moment": "^2.29.4",
                  "next": "13.1.2",
                  "next-compose-plugins": "^2.2.1",
                  "next-plugin-antd-less": "^1.8.0",
                  "next-redux-wrapper": "^8.1.0",
                  "next-seo": "^6.0.0",
                  "next-with-less": "^3.0.1",
                  "react": "18.2.0",
                  "react-dom": "18.2.0",
                  "react-qr-reader": "^3.0.0-beta-1",
                  "react-quill": "^2.0.0",
                  "react-redux": "^8.0.5",
                  "react-reveal": "^1.2.2",
                  "react-svg-to-image": "^3.0.0",
                  "react-to-print": "^2.14.13",
                  "react-transition-group": "^4.4.5",
                  "redux": "^4.2.0",
                  "redux-thunk": "^2.4.2",
                  "sharp": "^0.31.3",
                  "slugify-persian": "^1.0.1",
                  "swiper": "^9.1.0"
                },
                "devDependencies": {
                  "@types/node": "18.11.8",
                  "@types/react": "18.0.24",
                  "@types/react-dom": "18.0.8",
                  "@types/react-qr-reader": "^2.1.4",
                  "@types/react-transition-group": "^4.4.5",
                  "eslint": "8.26.0",
                  "eslint-config-next": "13.0.0",
                  "typescript": "4.8.4"
                }
              }
              
            `,
              async (err) => {
                if (err) {
                  console.error(err);
                }
                await exec(
                  `cd ${dist} && pm2 start yarn --name "${item.slug}" bash -- start`,
                );

                await exec(
                  `sudo ln -s /etc/nginx/sites-available/${item.domain}.conf /etc/nginx/sites-enabled/`,
                );
              },
            );

            await exec(`sudo service nginx reload`);
            // exec(
            //   `cd ${dist} && yarn run build`,
            //   async (error, stdout, stderr) => {
            //     if (error) {
            //       console.log(`error: ${error.message}`);
            //       return;
            //     }
            //     if (stderr) {
            //       console.log(`stderr: ${stderr}`);
            //       return;
            //     }
            //     console.log(`stdout: ${stdout}`);
            //   },
            // );

            // file written successfully
          },
        );
      });
    }

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
    let banner = null;
    if (updateSiteInput.logo) {
      const imageUpload = await imageUploader(updateSiteInput.logo);
      logo = imageUpload.image;
    }

    if (updateSiteInput.banner) {
      const imageUpload = await imageUploader(updateSiteInput.banner);
      banner = imageUpload.image;
    }

    const site = await this.siteRepository
      .createQueryBuilder('site')
      .update({
        ...updateSiteInput,
        ...(logo && { logo: logo }),
        ...(banner && { banner: banner }),
      })
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
