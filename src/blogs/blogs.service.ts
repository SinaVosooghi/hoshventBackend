import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { CreateBlogInput } from './dto/create-blog.input';
import { GetBlogsArgs } from './dto/get-blogs.args';
import { UpdateBlogInput } from './dto/update-blog.input';
import { Blog } from './entities/blog.entity';
import { imageUploader } from 'src/utils/imageUploader';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogInput: CreateBlogInput, user: User): Promise<Blog> {
    let image = null;
    if (createBlogInput.image) {
      const imageUpload = await imageUploader(createBlogInput.image);
      image = imageUpload.image;
    }

    const item = await this.blogRepository.create({
      ...createBlogInput,
      author: user,
      image,
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      return await this.blogRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll(
    {
      skip,
      limit,
      searchTerm,
      status,
      sort,
      featured,
      category,
      siteid,
    }: GetBlogsArgs,
    user: User,
  ) {
    const [result, total] = await this.blogRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
        ...(category !== 'all' && { category: { slug: category } }),
        ...(featured && { featured: true }),
        ...(featured === false && { featured: false }),
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(siteid && { site: { id: siteid } }),
      },
      relations: ['category', 'author'],
      order: {
        updated: 'DESC',
        ...(sort === 'highest' && { price: 'DESC' }),
        ...(sort === 'lowest' && { price: 'ASC' }),
        ...(sort === 'latest' && { created: 'DESC' }),
        ...(sort === 'oldest' && { created: 'ASC' }),
        ...(sort === 'lastupdate' && { updated: 'DESC' }),
      },
      take: limit,
      skip: skip,
    });

    return { blogs: result, count: total };
  }

  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id: id },
      relations: ['category', 'author', 'likes'],
    });

    if (!blog) {
      throw new NotFoundException(`Blog #${id} not found`);
    }
    return blog;
  }

  async findOneApi(slug: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { slug: slug },
      relations: ['category', 'author', 'likes'],
    });

    if (!blog) {
      throw new NotFoundException(`Blog #${slug} not found`);
    }
    return blog;
  }

  async update(id: number, updateBlogInput: UpdateBlogInput): Promise<Blog> {
    let image = null;
    if (updateBlogInput.image) {
      const imageUpload = await imageUploader(updateBlogInput.image);
      image = imageUpload.image;
    }

    const blog = await this.blogRepository
      .createQueryBuilder('blog')
      .update({ ...updateBlogInput, ...(image && { image: image }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!blog) {
      throw new NotFoundException(`Blog #${id} not found`);
    }
    return blog.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const blog = await this.blogRepository.findOneBy({ id: id });

    await this.blogRepository.remove(blog);
    return true;
  }
}
