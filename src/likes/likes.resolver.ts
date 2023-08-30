import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';
import { CreateLikeInput } from './dto/create-like.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Like)
export class LikesResolver {
  constructor(private readonly likesService: LikesService) {}

  @Mutation(() => Like)
  @UseGuards(GqlAuthGuard)
  createLike(
    @Args('input') createLikeInput: CreateLikeInput,
    @CurrentUser() user: User,
  ) {
    return this.likesService.create(createLikeInput, user);
  }

  @Query(() => [Like], { name: 'likes' })
  @UseGuards(GqlAuthGuard)
  findAll() {
    return this.likesService.findAll();
  }

  @Query(() => Like, { name: 'like' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.likesService.findOne(id);
  }

  @Mutation(() => Like)
  @UseGuards(GqlAuthGuard)
  removeLike(@Args('id', { type: () => Int }) id: number) {
    return this.likesService.remove(id);
  }
}
