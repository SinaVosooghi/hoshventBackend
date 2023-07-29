import { Module } from '@nestjs/common';
import { HallsService } from './halls.service';
import { HallsResolver } from './halls.resolver';
import { Hall } from './entities/hall.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, User])],
  providers: [HallsResolver, HallsService],
})
export class HallsModule {}
