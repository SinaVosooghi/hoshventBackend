import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateCommentInput } from './dto/create-comment.input';
import { GetCommentsArgs } from './dto/get-comments.args';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(
    createCommentInput: CreateCommentInput,
    user: User,
  ): Promise<Comment> {
    const item = await this.commentRepository.create({
      ...createCommentInput,
      ...(user && { site: { id: user.site[0]?.id } }),
    });
    return await this.commentRepository.save(item);
  }

  async findAll(
    { skip, limit, searchTerm, status }: GetCommentsArgs,
    user: User,
  ) {
    const [result, total] = await this.commentRepository.findAndCount({
      where: {
        body: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
        ...(user && { site: { id: user.site[0]?.id } }),
      },
      relations: ['blog', 'product', 'course', 'user'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { comments: result, count: total };
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: ['blog', 'product', 'course', 'user'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }
    return comment;
  }

  async update(
    id: number,
    updateCommentInput: UpdateCommentInput,
  ): Promise<Comment> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .update(updateCommentInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }
    return comment.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const comment = await this.commentRepository.findOneBy({ id: id });

    await this.commentRepository.remove(comment);
    return true;
  }
}
