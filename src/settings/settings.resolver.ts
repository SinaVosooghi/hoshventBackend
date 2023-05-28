import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';
import { CreateSettingInput } from './dto/create-setting.input';
import { UpdateSettingInput } from './dto/update-setting.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => Setting)
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  @Mutation(() => Setting)
  @UseGuards(GqlAuthGuard)
  createSetting(@Args('input') createSettingInput: CreateSettingInput) {
    return this.settingsService.create(createSettingInput);
  }

  @Query(() => [Setting], { name: 'settings' })
  @UseGuards(GqlAuthGuard)
  findAll() {
    return this.settingsService.findAll();
  }

  @Query(() => Setting, { name: 'getSetting' })
  async getSetting() {
    return this.settingsService.findOne();
  }

  @Mutation(() => Setting)
  @UseGuards(GqlAuthGuard)
  updateSetting(@Args('input') updateSettingInput: UpdateSettingInput) {
    return this.settingsService.update(updateSettingInput);
  }

  @Mutation(() => Setting)
  @UseGuards(GqlAuthGuard)
  removeSetting(@Args('id', { type: () => Int }) id: number) {
    return this.settingsService.remove(id);
  }
}
