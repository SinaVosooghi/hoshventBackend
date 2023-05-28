import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductPaginate } from './entities/paginate';
import { GetProductsArgs } from './dto/get-products.args';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  createProduct(@Args('input') createProductInput: CreateProductInput) {
    return this.productService.create(createProductInput);
  }

  @Query(() => ProductPaginate, { name: 'products' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getProductsArgs: GetProductsArgs) {
    return this.productService.findAll(getProductsArgs);
  }

  @Query(() => Product, { name: 'product' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productService.findOne(id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  updateProduct(@Args('input') updateProductInput: UpdateProductInput) {
    return this.productService.update(
      updateProductInput.id,
      updateProductInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeProduct(@Args('id', { type: () => Int }) id: number) {
    return this.productService.remove(id);
  }
}
