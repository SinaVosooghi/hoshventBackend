import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserPaginate } from './entities/paginate';
import { GetUsersApiArgs } from './dto/get-users.args';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UploadUsersPdfInput } from './dto/upload-pdf.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => Boolean)
  // @UseGuards(GqlAuthGuard)
  uploadUsersCsv(@Args('input') uploadUsersPdfInput: UploadUsersPdfInput) {
    return this.userService.uploadUsersCsv(uploadUsersPdfInput);
  }

  @Mutation(() => User)
  // @UseGuards(GqlAuthGuard)
  createUser(@Args('input') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => UserPaginate, { name: 'users' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @CurrentUser() user: User,
    @Args('input') getUsersApiArgs: GetUsersApiArgs,
  ) {
    return this.userService.findAll(getUsersApiArgs);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  updateUser(@Args('input') updateUserInput: UpdateUserInput) {
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }

  @Query(() => String, { name: 'usersPdf' })
  @UseGuards(GqlAuthGuard)
  usersPdf(@Args('input') getUsersApiArgs: GetUsersApiArgs) {
    return this.userService.getPdf(getUsersApiArgs);
  }
}
