import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-events.input';
import { EventPaginate } from './entities/paginate';
import { GetEventsArgs } from './dto/get-events.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Event)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  createEvent(
    @Args('input') createEventInput: CreateEventInput,
    @CurrentUser() user: User,
  ) {
    return this.eventsService.create(createEventInput, user);
  }

  @Query(() => EventPaginate, { name: 'events' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getEventsArgs: GetEventsArgs) {
    return this.eventsService.findAll(getEventsArgs);
  }

  @Query(() => Event, { name: 'event' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.eventsService.findOne(id);
  }

  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  updateEvent(@Args('input') updateEventInput: UpdateEventInput) {
    return this.eventsService.update(updateEventInput.id, updateEventInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeEvent(@Args('id', { type: () => Int }) id: number) {
    return this.eventsService.remove(id);
  }
}
