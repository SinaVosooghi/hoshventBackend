import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateMenuInput } from './dto/create-menu.input';
import { GetMenusArgs } from './dto/get-items.args';
import { UpdateMenuInput } from './dto/update-menu.input';
import { Menu } from './entities/menu.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuInput: CreateMenuInput, user: User): Promise<Menu> {
    const item = await this.menuRepository.create({
      ...createMenuInput,
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      return await this.menuRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll(
    { skip, limit, searchTerm, status, siteid }: GetMenusArgs,
    user: User,
  ) {
    const [result, total] = await this.menuRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(status && { status: status }),
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(siteid && { site: { id: siteid } }),
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { menus: result, count: total };
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id: id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu #${id} not found`);
    }
    return menu;
  }

  async update(id: number, updateMenuInput: UpdateMenuInput): Promise<Menu> {
    const menu = await this.menuRepository
      .createQueryBuilder('menu')
      .update({ ...updateMenuInput })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!menu) {
      throw new NotFoundException(`Menu #${id} not found`);
    }
    return menu.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const menu = await this.menuRepository.findOneBy({ id: id });

    await this.menuRepository.remove(menu);
    return true;
  }
}
