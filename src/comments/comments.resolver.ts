import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { CommentPaginate } from './entities/paginate';
import { GetCommentsArgs } from './dto/get-comments.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  createComment(
    @Args('input') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(createCommentInput, user);
  }

  @Query(() => CommentPaginate, { name: 'comments' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getCommentsArgs: GetCommentsArgs,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.findAll(getCommentsArgs, user);
  }

  @Query(() => Comment, { name: 'comment' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.commentsService.findOne(id);
  }

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  updateComment(@Args('input') updateCommentInput: UpdateCommentInput) {
    return this.commentsService.update(
      updateCommentInput.id,
      updateCommentInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeComment(@Args('id', { type: () => Int }) id: number) {
    return this.commentsService.remove(id);
  }
}
