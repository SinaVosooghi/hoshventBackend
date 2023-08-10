import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { GetRolesApiArgs } from './dto/get-roles.args';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleInput: CreateRoleInput, user: User): Promise<Role> {
    const item = await this.roleRepository.create({
      ...createRoleInput,
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      return await this.roleRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm }: GetRolesApiArgs, user: User) {
    const [result, total] = await this.roleRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(user && { site: { id: user.site[0]?.id } }),
      },
      relations: ['users'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { roles: result, count: total };
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id: id });
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }

    return role;
  }

  async update(id: number, updateRoleInput: UpdateRoleInput): Promise<Role> {
    const role = await this.roleRepository
      .createQueryBuilder('role')
      .update(updateRoleInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const role = await this.roleRepository.findOneBy({ id: id });

    await this.roleRepository.remove(role);
    return true;
  }
}
