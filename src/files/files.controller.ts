import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { diskStorage } from 'multer';
import {
  csvFileFilter,
  editFileName,
  imageFileFilter,
  pdfFileFilter,
  videoFileFilter,
} from 'src/utils/file-uploading.utils';
import { parse } from 'papaparse';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Controller()
export class FilesController {
  constructor(
    @InjectRepository(Category)
    private readonly categoryModel: Repository<Category>,
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private usersService: UsersService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
      limits: { fileSize: Math.pow(5120, 2), files: 1 },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(@UploadedFile() file) {
    const response = {
      originalname: file?.originalname,
      filename: file?.filename,
    };
    return response;
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('image', 20, {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
      limits: { fileSize: Math.pow(5120, 2), files: 4 },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles()
    files,
  ) {
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file?.originalname,
        filename: file?.filename,
      };
      response.push(fileReponse);
    });
    return response;
  }

  @Post('file')
  @UseInterceptors(
    FilesInterceptor('file', 20, {
      storage: diskStorage({
        destination: './files/documents',
        filename: editFileName,
      }),
      limits: { fileSize: Math.pow(5120, 2), files: 4 },
      fileFilter: pdfFileFilter,
    }),
  )
  async uploadDocuments(@UploadedFiles() files) {
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file?.originalname,
        filename: file?.filename,
      };
      response.push(fileReponse);
    });
    return response;
  }

  @Post('video')
  @UseInterceptors(
    FilesInterceptor('file', 20, {
      storage: diskStorage({
        destination: './files/video',
        filename: editFileName,
      }),
      limits: { fileSize: Math.pow(100120, 2), files: 1 },
      fileFilter: videoFileFilter,
    }),
  )
  async videofile(@UploadedFiles() files) {
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file?.originalname,
        filename: file?.filename,
      };
      response.push(fileReponse);
    });
    return response;
  }

  @Post('csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files/users',
        filename: editFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  async uploadedCSV(
    @UploadedFile() file,
    @Body('exhibition') exhibition: string,
  ) {
    const csvFile = readFileSync(file?.path);

    const csvData = csvFile.toString();

    const parsedCSV = parse(csvData, {
      config: {
        newline: '',
        delimiter: '',
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace('#', '').trim(),
      complete: (results) => results.data,
    });

    if (parsedCSV.data.length > 0) {
      parsedCSV.data.map(async (item) => {
        const category = await this.categoryModel.findOneBy({
          title: item.category.trim(),
          type: 'user',
        });

        if (item.title && item.type) {
          let user = null;
          if (item.mobile) {
            user = await this.userModel.findOneBy({
              mobilenumber: item.mobile,
            });
            if (!user) {
              user = await this.userModel.create({
                lastName: item.family,
                firstName: item.name,
                mobilenumber: item.mobile,
                username: item.mobile,
                usertype: 'user',
              });
            }
          }
        } else {
          throw new Error('اطلاعات صحبح نیست');
        }
      });
    }

    return parsedCSV;
  }
}
