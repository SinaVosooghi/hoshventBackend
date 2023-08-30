import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesService } from 'src/messages/messages.service';
import { User } from 'src/users/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { CreateChatInput } from './dto/create-chat.input';
import { GetChatsArgs } from './dto/get-chats.args';
import { Chat } from './entities/chat.entity';
import { sendSMS } from 'src/utils/sendSMS';
import { MailService } from 'src/mail/mail.service';
import { SitesService } from 'src/sites/sites.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly useRepo: Repository<User>,
    private readonly messageService: MessagesService,
    private readonly mailService: MailService,
    private readonly sitesService: SitesService,
  ) {}

  async create(createChatInput: CreateChatInput, user: User): Promise<boolean> {
    const site = await this.sitesService.findOne(user.site[0]?.id);
    const chats = (await this.findAll({ sms: true }, user)).count;

    if (createChatInput.sms) {
      if (chats >= site.plan.sms) {
        throw new Error('SMS Count finished');
      }
    }

    try {
      if (createChatInput.category) {
        const users = await this.useRepo.find({
          where: {
            category: { id: createChatInput.category },
            ...(user && { siteid: { id: user.site[0]?.id } }),
          },
        });

        if (users.length > 0) {
          users.map(async (userItem: User) => {
            if (createChatInput.sms) {
              await sendSMS({
                to: userItem.mobilenumber,
                message: createChatInput.body,
              });
            }

            if (createChatInput.email) {
              await this.mailService.sendCustom(
                userItem,
                createChatInput.body,
                createChatInput.subject,
              );
            }

            if (createChatInput.system) {
              const item = await this.chatRepository.create({
                ...createChatInput,
                to: userItem,
                from: user,
                ...(createChatInput.sms && { sms: true }),
                ...(createChatInput.email && { email: true }),
                ...(user && { site: { id: user.site[0]?.id } }),
              });
              const chat = await this.chatRepository.save(item);

              this.messageService.create(
                {
                  chat: chat,
                  body: createChatInput.body,
                },
                user,
              );
            }
          });
        }
      } else if (createChatInput.to) {
        createChatInput.to.map(async (userItem) => {
          if (createChatInput.sms) {
            await sendSMS({
              to: userItem.mobilenumber,
              message: createChatInput.body,
            });
          }

          if (createChatInput.email) {
            await this.mailService.sendCustom(
              userItem,
              createChatInput.body,
              createChatInput.subject ?? 'Hoshvent',
            );
          }

          const item = await this.chatRepository.create({
            ...createChatInput,
            to: userItem,
            from: user,
            ...(user && { site: { id: user.site[0]?.id } }),
          });
          const chat = await this.chatRepository.save(item);

          this.messageService.create(
            {
              chat: chat,
              body: createChatInput.body,
            },
            user,
          );
        });
      } else {
        const users = await this.useRepo.find({
          where: {
            ...(user && { siteid: { id: user.site[0]?.id } }),
          },
        });

        if (users.length > 0) {
          users.map(async (userItem: User) => {
            if (createChatInput.sms) {
              console.log('sms');
              await sendSMS({
                to: userItem.mobilenumber,
                message: createChatInput.body,
              });
            }

            if (createChatInput.email) {
              console.log('Send email');
            }

            if (createChatInput.system) {
              const item = await this.chatRepository.create({
                ...createChatInput,
                to: userItem,
                from: user,
                ...(user && { site: { id: user.site[0]?.id } }),
              });
              const chat = await this.chatRepository.save(item);

              this.messageService.create(
                {
                  chat: chat,
                  body: createChatInput.body,
                },
                user,
              );
            }
          });
        }
      }

      return true;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async createUserChat(
    createChatInput: CreateChatInput,
    user: User,
  ): Promise<boolean> {
    const site = await this.sitesService.findOne(createChatInput.site);

    try {
      const item = await this.chatRepository.create({
        ...createChatInput,
        to: site.user,
        from: user,
        site,
      });
      const chat = await this.chatRepository.save(item);

      this.messageService.create(
        {
          chat: chat,
          body: createChatInput.body,
        },
        user,
      );

      return true;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async createInvoice(
    createChatInput: CreateChatInput,
    currentUser: User,
  ): Promise<boolean> {
    try {
      createChatInput.to.map(async (userItem) => {
        const item = await this.chatRepository.create({
          subject: createChatInput.subject,
          repliable: false,
          priority: 'high',
          type: 'invoice',
          from: currentUser,
          to: userItem,
          invoice: createChatInput.invoice,
          ...(currentUser && { site: { id: currentUser.site[0].id } }),
        });
        const chat = await this.chatRepository.save(item);

        this.messageService.create(
          {
            chat: chat,
            body: createChatInput.body,
          },
          currentUser,
        );
      });

      return true;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
      throw new Error(err);
    }
  }

  async findAll(
    {
      skip,
      limit,
      searchTerm,
      type,
      status,
      priority,
      department,
      sms,
    }: GetChatsArgs,
    user: User,
  ) {
    const [result, total] = await this.chatRepository.findAndCount({
      where: {
        subject: searchTerm ? Like(`%${searchTerm}%`) : null,
        type: type ?? null,
        status: status ?? null,
        priority: priority ?? null,
        department: department ? { id: department } : null,
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(sms && { sms: true }),
      },
      relations: ['messages', 'from', 'messages.user', 'invoice', 'department'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });
    return { chats: result, count: total };
  }

  async findAllApi(
    { skip, limit, searchTerm, type, status, priority }: GetChatsArgs,
    user: User,
  ) {
    const [result, total] = await this.chatRepository.findAndCount({
      where: [
        {
          subject: searchTerm ? Like(`%${searchTerm}%`) : null,
          ...(user && { site: { id: user.site[0]?.id } }),
        },
        { type: type ?? null },
        { status: status ?? null },
        { priority: priority ?? null },
        { from: user ? { id: user.id } : null },
        { to: user ? { id: user.id } : null },
      ],
      relations: ['messages', 'from', 'messages.user', 'invoice', 'department'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });
    return { chats: result, count: total };
  }

  async findOne(id: number): Promise<Chat> {
    const message = await this.chatRepository.findOne({
      where: { id: id },
      relations: [
        'messages',
        'from',
        'to',
        'messages.user',
        'invoice',
        'department',
      ],
    });
    if (!message) {
      throw new NotFoundException(`Chat #${id} not found`);
    }

    return message;
  }

  async findOneApi(id: number, user: User): Promise<Chat> {
    const message = await this.chatRepository.findOne({
      where: { id: id },
      relations: [
        'messages',
        'from',
        'to',
        'messages.user',
        'invoice',
        'department',
      ],
    });
    if (!message) {
      throw new NotFoundException(`Chat #${id} not found`);
    }

    return message;
  }

  async remove(id: number): Promise<boolean> {
    const message = await this.chatRepository.findOneBy({ id: id });

    await this.chatRepository.remove(message);
    return true;
  }
}
