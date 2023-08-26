import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { ChatsApiResolver } from './chats.api.resolver';
import { User } from 'src/users/entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { SitesModule } from 'src/sites/sites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User]),
    MessagesModule,
    MailModule,
    SitesModule,
  ],
  providers: [ChatsResolver, ChatsService, ChatsApiResolver],
})
export class ChatsModule {}
