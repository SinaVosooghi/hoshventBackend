import { HttpException, HttpStatus } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';

export const csvUploader = async (csv): Promise<{ csv?: string }> => {
  const { createReadStream, filename } = await csv;

  return new Promise(async (resolve) => {
    createReadStream()
      .pipe(createWriteStream(join(process.cwd(), `./files/csv/${filename}`)))
      .on('finish', () => {
        return resolve({
          csv: filename,
        });
      })
      .on('error', (err) => {
        console.log(err);
        new HttpException('Could not save csv', HttpStatus.BAD_REQUEST);
      });
  });
};
