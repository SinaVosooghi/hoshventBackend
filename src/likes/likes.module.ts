import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  providers: [LikesResolver, LikesService],
})
export class LikesModule {}
