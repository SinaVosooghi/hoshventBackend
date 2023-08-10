import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateDepartmentInput } from './dto/create-department.input';
import { GetDepartmentsArgs } from './dto/get-departments.args';
import { UpdateDepartmentInput } from './dto/update-department.input';
import { Department } from './entities/department.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(
    createDepartmentInput: CreateDepartmentInput,
    user: User,
  ): Promise<Department> {
    const item = await this.departmentRepository.create({
      ...createDepartmentInput,
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      return await this.departmentRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll(
    { skip, limit, searchTerm, status }: GetDepartmentsArgs,
    user: User,
  ) {
    const [result, total] = await this.departmentRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
        ...(user && { site: { id: user.site[0]?.id } }),
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { departments: result, count: total };
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id: id },
    });
    if (!department) {
      throw new NotFoundException(`Department #${id} not found`);
    }
    return department;
  }

  async update(
    id: number,
    updateDepartmentInput: UpdateDepartmentInput,
  ): Promise<Department> {
    const department = await this.departmentRepository
      .createQueryBuilder('department')
      .update(updateDepartmentInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!department) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return department.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const department = await this.departmentRepository.findOneBy({ id: id });

    await this.departmentRepository.remove(department);
    return true;
  }
}
