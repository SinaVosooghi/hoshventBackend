import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { GetUserMobileApiArgs } from './dto/get-user.args';

@Resolver(() => User)
export class UserApiResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => User, { name: 'updateUserApi' })
  @UseGuards(GqlAuthGuard)
  updateUser(@Args('input') updateUserInput: UpdateUserInput) {
    return this.userService.updateApi(updateUserInput);
  }

  @Query(() => User, { name: 'userByMobile' })
  useByMobile(@Args('input') getUser: GetUserMobileApiArgs) {
    return this.userService.findByMobile(getUser);
  }
}
