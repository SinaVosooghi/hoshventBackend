import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventPaginate } from './entities/paginate';
import { GetEventsArgs } from './dto/get-events.args';

@Resolver(() => Event)
export class EventsApiResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Query(() => EventPaginate, { name: 'eventsApi' })
  findAll(@Args('input') getEventsArgs: GetEventsArgs) {
    return this.eventsService.findAll(getEventsArgs);
  }

  @Query(() => Event, { name: 'blogApi' })
  findOne(@Args('slug', { type: () => String }) slug: string) {
    return this.eventsService.findOneApi(slug);
  }
}
