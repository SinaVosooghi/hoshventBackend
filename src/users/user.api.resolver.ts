import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => User)
export class UserApiResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => User, { name: 'updateUserApi' })
  @UseGuards(GqlAuthGuard)
  updateUser(@Args('input') updateUserInput: UpdateUserInput) {
    return this.userService.updateApi(updateUserInput);
  }

  @Query(() => User, { name: 'userByMobile' })
  useByMobile(
    @Args('mobilenumber', { type: () => String }) mobilenumber: string,
  ) {
    return this.userService.findByMobile(mobilenumber);
  }
}
