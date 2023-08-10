import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Menu } from './entities/menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { MenuPaginate } from './entities/paginate';
import { GetMenusArgs } from './dto/get-items.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { MenusService } from './menus.service';

@Resolver(() => Menu)
export class MenusResolver {
  constructor(private readonly menusService: MenusService) {}

  @Mutation(() => Menu)
  @UseGuards(GqlAuthGuard)
  createMenu(
    @Args('input') createMenuInput: CreateMenuInput,
    @CurrentUser() user: User,
  ) {
    return this.menusService.create(createMenuInput, user);
  }

  @Query(() => MenuPaginate, { name: 'menus' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getMenusArgs: GetMenusArgs,
    @CurrentUser() user: User,
  ) {
    return this.menusService.findAll(getMenusArgs, user);
  }

  @Query(() => Menu, { name: 'menu' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.findOne(id);
  }

  @Mutation(() => Menu)
  @UseGuards(GqlAuthGuard)
  updateMenu(@Args('input') updateMenuInput: UpdateMenuInput) {
    return this.menusService.update(updateMenuInput.id, updateMenuInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeMenu(@Args('id', { type: () => Int }) id: number) {
    return this.menusService.remove(id);
  }
}
