import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { MenusService } from './menus.service';
import { Menu } from './entities/menu.entity';

import { MenuPaginate } from './entities/paginate';
import { GetMenusArgs } from './dto/get-items.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Menu)
export class MenusApiResolver {
  constructor(private readonly menusService: MenusService) {}

  @Query(() => MenuPaginate, { name: 'menusApi' })
  findAll(
    @Args('input') getMenusArgs: GetMenusArgs,
    @CurrentUser() user: User,
  ) {
    return this.menusService.findAll(getMenusArgs, user);
  }

  @Query(() => Menu, { name: 'menuApi' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.findOne(id);
  }
}
