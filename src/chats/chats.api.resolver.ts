import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { CreateChatInput } from './dto/create-chat.input';
import { ChatPaginate } from './entities/paginate';
import { GetChatsArgs } from './dto/get-chats.args';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Resolver(() => Chat)
export class ChatsApiResolver {
  constructor(private readonly chatsService: ChatsService) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  createChat(
    @CurrentUser() user: User,
    @Args('input') createChatInput: CreateChatInput,
  ) {
    return this.chatsService.create(createChatInput, user);
  }

  @Mutation(() => Boolean, { name: 'createUserChatApi' })
  @UseGuards(GqlAuthGuard)
  createUserChat(
    @CurrentUser() user: User,
    @Args('input') createChatInput: CreateChatInput,
  ) {
    return this.chatsService.createUserChat(createChatInput, user);
  }

  @Query(() => ChatPaginate, { name: 'chatsApi' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getChatsArgs: GetChatsArgs,
    @CurrentUser() user: User,
  ) {
    return this.chatsService.findAllApi(getChatsArgs, user);
  }

  @Query(() => Chat, { name: 'chatApi' })
  @UseGuards(GqlAuthGuard)
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.chatsService.findOneApi(id, user);
  }
}
