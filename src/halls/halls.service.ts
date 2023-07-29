import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CreateHallInput } from './dto/create-hall.input';
import { GetHallsArgs } from './dto/get-items.args';
import { UpdateHallInput } from './dto/update-hall.input';
import { Hall } from './entities/hall.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createHallInput: CreateHallInput): Promise<Hall> {
    let image = null;

    if (createHallInput.image) {
      const imageUpload = await imageUploader(createHallInput.image);
      image = imageUpload.image;
    }

    const item = await this.hallRepository.create({
      ...createHallInput,
      image,
    });

    try {
      const hall = await this.hallRepository.save(item);
      return hall;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, status, featured }: GetHallsArgs) {
    const [result, total] = await this.hallRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status,
        ...(featured && { featured: featured }),
      },
      relations: ['user', 'event', 'event.site'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { halls: result, count: total };
  }

  async findOne(id: number): Promise<Hall> {
    const hall = await this.hallRepository.findOne({
      where: { id: id },
      relations: ['user', 'event', 'event.site'],
    });
    if (!hall) {
      throw new NotFoundException(`Hall #${id} not found`);
    }
    return hall;
  }

  async update(id: number, updateHallInput: UpdateHallInput): Promise<Hall> {
    let image = null;
    if (updateHallInput.image) {
      const imageUpload = await imageUploader(updateHallInput.image);
      image = imageUpload.image;
    }

    const category = await this.hallRepository
      .createQueryBuilder('category')
      .update({ ...updateHallInput, ...(image && { image: image }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!category) {
      throw new NotFoundException(`Hall #${id} not found`);
    }
    return category.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const hall = await this.hallRepository.findOneBy({ id: id });

    await this.hallRepository.softRemove(hall);
    return true;
  }
}
