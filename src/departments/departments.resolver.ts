import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { CreateDepartmentInput } from './dto/create-department.input';
import { UpdateDepartmentInput } from './dto/update-department.input';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { DepartmentPaginate } from './entities/paginate';
import { GetDepartmentsArgs } from './dto/get-departments.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Department)
export class DepartmentsResolver {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Mutation(() => Department)
  @UseGuards(GqlAuthGuard)
  createDepartment(
    @Args('input') createDepartmentInput: CreateDepartmentInput,
    @CurrentUser() user: User,
  ) {
    return this.departmentsService.create(createDepartmentInput, user);
  }

  @Query(() => DepartmentPaginate, { name: 'departments' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getDepartmentsArgs: GetDepartmentsArgs,
    @CurrentUser() user: User,
  ) {
    return this.departmentsService.findAll(getDepartmentsArgs, user);
  }

  @Query(() => Department, { name: 'department' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Mutation(() => Department)
  @UseGuards(GqlAuthGuard)
  updateDepartment(
    @Args('input') updateDepartmentInput: UpdateDepartmentInput,
  ) {
    return this.departmentsService.update(
      updateDepartmentInput.id,
      updateDepartmentInput,
    );
  }

  @Mutation(() => Boolean)
  removeDepartment(@Args('id', { type: () => Int }) id: number) {
    return this.departmentsService.remove(id);
  }
}
