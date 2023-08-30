import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLikeInput } from './dto/create-like.input';
import { Like } from './entities/like.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async create(createLikeInput: CreateLikeInput, user: User): Promise<Like> {
    if (!user) throw new Error('No User');
    const obj = {
      user: { id: user.id },
      ...(createLikeInput.blog && {
        blog: { id: createLikeInput.blog },
      }),
      like: createLikeInput.like,
    };

    const like = await this.likeRepository.findOne({
      where: {
        user: { id: user.id },
        ...(createLikeInput.course && {
          course: { id: createLikeInput.course },
        }),
        ...(createLikeInput.product && {
          product: { id: createLikeInput.product },
        }),
        ...(createLikeInput.blog && {
          blog: { id: createLikeInput.blog },
        }),
      },
    });

    if (like) {
      this.likeRepository.remove(like);
      return like;
    }

    const item = await this.likeRepository.create(obj);

    try {
      return await this.likeRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll(): Promise<Array<Like>> {
    return await this.likeRepository.find();
  }

  async findOne(id: number): Promise<Like> {
    const like = await this.likeRepository.findOneBy({ id: id });
    if (!like) {
      throw new NotFoundException(`Like #${id} not found`);
    }
    return like;
  }

  async remove(id: number): Promise<boolean> {
    const like = await this.likeRepository.findOneBy({ id: id });

    await this.likeRepository.remove(like);
    return true;
  }
}
