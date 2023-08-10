import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusResolver } from './menus.resolver';
import { Menu } from './entities/menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusApiResolver } from './menus.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  providers: [MenusResolver, MenusService, MenusApiResolver],
})
export class MenusModule {}
