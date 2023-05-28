import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { CreateProductInput } from './dto/create-product.input';
import { GetProductsArgs } from './dto/get-products.args';
import { UpdateProductInput } from './dto/update-product.input';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductInput: CreateProductInput): Promise<Product> {
    const item = await this.productRepository.create({
      ...createProductInput,
      slug: createProductInput.slug.trim().toLowerCase(),
    });
    try {
      return await this.productRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({
    skip,
    limit,
    searchTerm,
    status,
    featured,
    price,
    category,
    sort,
  }: GetProductsArgs) {
    const [result, total] = await this.productRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
        ...(price === 'free' && { price: IsNull() }),
        ...(price === 'cash' && { price: Not(IsNull()) }),
        ...(category !== 'all' && { category: { slug: category } }),
        ...(featured && { featured: true }),
        ...(featured === false && { featured: false }),
      },
      order: {
        ...(sort === 'highest' && { price: 'DESC' }),
        ...(sort === 'lowest' && { price: 'ASC' }),
        ...(sort === 'latest' && { created: 'DESC' }),
        ...(sort === 'oldest' && { created: 'ASC' }),
        ...(sort === 'lastupdate' && { updated: 'DESC' }),
      },
      relations: ['category'],
      take: limit,
      skip: skip,
    });

    return { products: result, count: total };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async findOneBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug: slug },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Course #${slug} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .update(updateProductInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!product) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return product.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const product = await this.productRepository.findOneBy({ id: id });

    await this.productRepository.remove(product);
    return true;
  }
}
