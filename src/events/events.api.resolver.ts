import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventPaginate } from './entities/paginate';
import { GetEventsArgs } from './dto/get-events.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AttendeePaginate } from 'src/atendees/entities/paginate';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => Event)
export class EventsApiResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Query(() => EventPaginate, { name: 'eventsApi' })
  findAll(
    @Args('input') getEventsArgs: GetEventsArgs,
    @CurrentUser() user: User,
  ) {
    return this.eventsService.findAll(getEventsArgs, user);
  }

  @Query(() => Event, { name: 'eventApi' })
  findOne(@Args('slug', { type: () => String }) slug: string) {
    return this.eventsService.findOneApi(slug);
  }

  @Query(() => AttendeePaginate, { name: 'userEventsApi' })
  @UseGuards(GqlAuthGuard)
  findUserAll(
    @CurrentUser() user: User,
    @Args('input') getEventsArgs: GetEventsArgs,
  ) {
    return this.eventsService.findUserEvents(getEventsArgs, user);
  }
}
