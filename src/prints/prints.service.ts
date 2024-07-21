import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreatePrintInput } from './dto/create-print.input';
import { Print } from './entities/print.entity';
import { GetPrintsArgs } from './dto/get-prints.args';

@Injectable()
export class PrintsService {
  constructor(
    @InjectRepository(Print)
    private readonly printRepository: Repository<Print>,
  ) {}

  async create(createPrintInput: CreatePrintInput): Promise<Print> {
    const obj = {
      user: { id: createPrintInput.user },
      site: { id: createPrintInput.site },
    };

    const item = await this.printRepository.create(obj);

    try {
      return await this.printRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({
    skip,
    limit,
    siteid,
    all,
    startDate,
    endDate,
  }: GetPrintsArgs) {
    const whereConditions: any = {
      ...(startDate && { created: Between(startDate, endDate) }),
      ...(siteid && !all && { site: { id: siteid } }),
    };

    const [result, total] = await this.printRepository.findAndCount({
      where: whereConditions,
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { prints: result, count: total };
  }

  async findOne(id: number): Promise<Print> {
    const print = await this.printRepository.findOneBy({ id: id });
    if (!print) {
      throw new NotFoundException(`Print #${id} not found`);
    }
    return print;
  }

  async remove(id: number): Promise<boolean> {
    const print = await this.printRepository.findOneBy({ id: id });

    await this.printRepository.remove(print);
    return true;
  }
}
