import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AttendeesService } from './atendees.service';
import { CreateAtendeeInput } from './dto/create-atendee.input';
import { UpdateAttendeeInput } from './dto/update-atendee.input';
import { AttendeePaginate } from './entities/paginate';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { GetAttendeesArgs } from './dto/get-attendees.args';
import { Attendee } from './entities/attendee.entity';

@Resolver(() => Attendee)
export class AttendeesResolver {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Mutation(() => Attendee)
  @UseGuards(GqlAuthGuard)
  createAttendee(@Args('input') createAttendeeInput: CreateAtendeeInput) {
    return this.attendeesService.create(createAttendeeInput);
  }

  @Query(() => AttendeePaginate, { name: 'attendees' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getattendeesArgs: GetAttendeesArgs) {
    return this.attendeesService.findAll(getattendeesArgs);
  }

  @Query(() => Attendee, { name: 'Attendee' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.attendeesService.findOne(id);
  }

  @Mutation(() => Attendee)
  @UseGuards(GqlAuthGuard)
  updateAttendee(@Args('input') updateAttendeeInput: UpdateAttendeeInput) {
    return this.attendeesService.update(
      updateAttendeeInput.id,
      updateAttendeeInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeAttendee(@Args('id', { type: () => Int }) id: number) {
    return this.attendeesService.remove(id);
  }
}
