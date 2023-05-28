import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { ProductPaginate } from './entities/paginate';
import { GetProductsArgs } from './dto/get-products.args';

@Resolver(() => Product)
export class ProductApiResolver {
  constructor(private readonly productService: ProductService) {}
  @Query(() => ProductPaginate, { name: 'productsApi' })
  findAll(@Args('input') getProductsArgs: GetProductsArgs) {
    return this.productService.findAll(getProductsArgs);
  }

  @Query(() => Product, { name: 'productApi' })
  findOne(@Args('slug', { type: () => String }) slug: string) {
    return this.productService.findOneBySlug(slug);
  }
}
