import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TimelinesService } from './timelines.service';
import { Timeline } from './entities/timeline.entity';
import { CreateTimelineInput } from './dto/create-timeline.input';
import { UpdateTimelineInput } from './dto/update-timeline.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { GetTimelinsArgs } from './dto/get-items.args';
import { TimelinePaginate } from './entities/timelinePagintate';

@Resolver(() => Timeline)
export class TimelinesResolver {
  constructor(private readonly timelinesService: TimelinesService) {}

  @Mutation(() => Timeline)
  @UseGuards(GqlAuthGuard)
  createTimeline(
    @Args('input') createTimelineInput: CreateTimelineInput,
    @CurrentUser() user: User,
  ) {
    return this.timelinesService.create(createTimelineInput, user);
  }

  @Query(() => [Timeline], { name: 'timelines' })
  findAll() {
    return this.timelinesService.findAll();
  }

  @Query(() => TimelinePaginate, { name: 'userTimelines' })
  @UseGuards(GqlAuthGuard)
  @UseGuards(GqlAuthGuard)
  userTimelines(
    @Args('input') getTimelinsArgs: GetTimelinsArgs,
    @CurrentUser() user: User,
  ) {
    return this.timelinesService.userTimelines(getTimelinsArgs, user);
  }

  @Query(() => Attendee, { name: 'timeline' })
  @UseGuards(GqlAuthGuard)
  findOne(
    @Args('url', { type: () => String }) url: string,
    @CurrentUser() user: User,
  ) {
    return this.timelinesService.findOne(url, user);
  }

  @Mutation(() => Boolean, { name: 'checkin' })
  @UseGuards(GqlAuthGuard)
  checkin(
    @Args('aid', { type: () => Int }) aid: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('type', { type: () => String }) type: string,
    @CurrentUser() user: User,
  ) {
    return this.timelinesService.checkin(aid, id, type, user);
  }

  @Mutation(() => Boolean, { name: 'checkout' })
  @UseGuards(GqlAuthGuard)
  checkout(
    @Args('id', { type: () => Int }) id: number,
    @Args('aid', { type: () => Int }) aid: number,
    @Args('type', { type: () => String }) type: string,
    @CurrentUser() user: User,
  ) {
    return this.timelinesService.checkout(aid, id, type, user);
  }

  @Mutation(() => Timeline)
  updateTimeline(
    @Args('updateTimelineInput') updateTimelineInput: UpdateTimelineInput,
  ) {
    return this.timelinesService.update(
      updateTimelineInput.id,
      updateTimelineInput,
    );
  }

  @Mutation(() => Timeline)
  removeTimeline(@Args('id', { type: () => Int }) id: number) {
    return this.timelinesService.remove(id);
  }
}
