import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlAbacGuard } from '../permissions/guards/gql-abac.guard';
import { RequiredPermission } from '../permissions/decorators/abac.decorator';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => Category)
  async category(@Args('id', { type: () => Int }) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('create', 'categories')
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryInput);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('update', 'categories')
  async updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoriesService.update(updateCategoryInput.id, updateCategoryInput);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('delete', 'categories')
  async deleteCategory(@Args('id', { type: () => Int }) id: number): Promise<string> {
    const result = await this.categoriesService.delete(id);
    return result.message;
  }
}
