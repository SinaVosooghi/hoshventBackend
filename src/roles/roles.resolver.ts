import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { GetRolesApiArgs } from './dto/get-roles.args';
import { RolePaginate } from './entities/rolePaginate';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => Role)
export class RolesResolver {
  constructor(private readonly roleService: RolesService) {}

  @Mutation(() => Role)
  // @UseGuards(GqlAuthGuard)
  createRole(@Args('input') createRoleInput: CreateRoleInput) {
    return this.roleService.create(createRoleInput);
  }

  @Query(() => RolePaginate, { name: 'roles' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getRolesApiArgs: GetRolesApiArgs) {
    return this.roleService.findAll(getRolesApiArgs);
  }

  @Query(() => Role, { name: 'role' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.roleService.findOne(id);
  }

  @Mutation(() => Role)
  @UseGuards(GqlAuthGuard)
  updateRole(@Args('input') updateRoleInput: UpdateRoleInput) {
    return this.roleService.update(updateRoleInput.id, updateRoleInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeRole(@Args('id', { type: () => Int }) id: number) {
    return this.roleService.remove(id);
  }
}
