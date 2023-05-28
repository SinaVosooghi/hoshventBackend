import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Resolver(() => User)
export class UserApiResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => User, { name: 'updateUserApi' })
  @UseGuards(GqlAuthGuard)
  updateUser(
    @Args('input') updateUserInput: UpdateUserInput,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateApi(updateUserInput, user);
  }
}
