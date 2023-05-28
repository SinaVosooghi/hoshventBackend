import { Module } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { WorkshopsResolver } from './workshops.resolver';
import { Workshop } from './entities/workshop.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop, User])],
  providers: [WorkshopsResolver, WorkshopsService],
})
export class WorkshopsModule {}
