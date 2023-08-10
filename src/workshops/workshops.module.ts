import { Module } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { WorkshopsResolver } from './workshops.resolver';
import { Workshop } from './entities/workshop.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { WorkshopsApiResolver } from './workshops.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop, User])],
  providers: [WorkshopsResolver, WorkshopsService, WorkshopsApiResolver],
})
export class WorkshopsModule {}
