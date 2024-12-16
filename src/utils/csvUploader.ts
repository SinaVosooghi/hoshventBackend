import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

export const csvUploader = async (csv): Promise<{ csv?: string }> => {
  const { createReadStream, filename } = await csv;

  const uploadDir = join(process.cwd(), './files/csv');

  try {
    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const filePath = join(uploadDir, filename);

      const writeStream = createWriteStream(filePath);

      createReadStream()
        .pipe(writeStream)
        .on('finish', () => {
          resolve({ csv: filename });
        })
        .on('error', (err) => {
          console.error(err);
          reject(
            new HttpException('Could not save csv', HttpStatus.BAD_REQUEST),
          );
        });
    });
  } catch (err) {
    console.error('Directory creation error:', err);
    throw new HttpException(
      'Could not create directory',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
