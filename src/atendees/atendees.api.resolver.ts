import { Resolver, Query, Args } from '@nestjs/graphql';
import { AttendeesService } from './atendees.service';
import { AttendeePaginate } from './entities/paginate';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { GetAttendeesArgs } from './dto/get-attendees.args';
import { Attendee } from './entities/attendee.entity';

@Resolver(() => Attendee)
export class AttendeesApiResolver {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Query(() => AttendeePaginate, { name: 'attendeesApi' })
  @UseGuards(GqlAuthGuard)
  findAllApi(@Args('input') getattendeesArgs: GetAttendeesArgs) {
    return this.attendeesService.findAllApi(getattendeesArgs);
  }
}
