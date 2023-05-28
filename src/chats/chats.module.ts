import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { ChatsApiResolver } from './chats.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Chat]), MessagesModule],
  providers: [ChatsResolver, ChatsService, ChatsApiResolver],
})
export class ChatsModule {}
