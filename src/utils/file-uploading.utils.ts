import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
    return callback(
      new BadRequestException('فرمت تصویر اشتباه است(jpg,jpeg,png,gif)'),
      false,
    );
  }
  callback(null, true);
};

export const pdfFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf)$/)) {
    return callback(
      new BadRequestException('فرمت فایل اشتباه است (PDF)'),
      false,
    );
  }
  callback(null, true);
};

export const videoFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(mp4)$/)) {
    return callback(new BadRequestException('فرمت فایل اشتباه است '), false);
  }
  callback(null, true);
};

export const csvFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(
      new BadRequestException('فرمت فایل اشتباه است (CSV)'),
      false,
    );
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname
    .split('.')[0]
    .replace(/\s+/g, '-')
    .toLowerCase();
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
