import { HttpException, HttpStatus } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';

export const fileUploader = async (image): Promise<{ image?: string }> => {
  const { createReadStream, filename } = await image;

  return new Promise(async (resolve) => {
    createReadStream()
      .pipe(
        createWriteStream(join(process.cwd(), `./files/documents/${filename}`)),
      )
      .on('finish', () => {
        return resolve({
          image: filename,
        });
      })
      .on('error', (err) => {
        console.log(err);
        new HttpException('Could not save image', HttpStatus.BAD_REQUEST);
      });
  });
};
