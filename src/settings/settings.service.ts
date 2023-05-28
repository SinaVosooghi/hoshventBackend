import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSettingInput } from './dto/create-setting.input';
import { UpdateSettingInput } from './dto/update-setting.input';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async create(createSettingInput: CreateSettingInput): Promise<Setting> {
    const item = await this.settingRepository.create(createSettingInput);
    return await this.settingRepository.save(item);
  }

  async findAll(): Promise<Array<Setting>> {
    return await this.settingRepository.find();
  }

  async findOne(): Promise<Setting | null> {
    const setting = await this.settingRepository.find({
      skip: 0,
      take: 1,
      order: { created: 'DESC' },
    });

    if (!setting) {
      throw new NotFoundException(`Setting not found`);
    }
    return setting[0];
  }

  async update(updateSettingInput: UpdateSettingInput): Promise<Setting> {
    const setting = await this.settingRepository.find({
      skip: 0,
      take: 1,
      order: { created: 'DESC' },
    });

    if (!setting) {
      throw new NotFoundException(`Setting not found`);
    }

    const settings = await this.settingRepository
      .createQueryBuilder('message')
      .update(updateSettingInput)
      .where({ id: setting[0].id })
      .returning('*')
      .execute();

    return settings.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const message = await this.settingRepository.findOneBy({ id: id });

    await this.settingRepository.remove(message);
    return true;
  }
}
