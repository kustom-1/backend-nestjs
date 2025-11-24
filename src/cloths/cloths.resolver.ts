import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClothsService } from './cloths.service';
import { Cloth } from './cloth.entity';
import { CreateClothInput } from './dto/create-cloth.input';
import { UpdateClothInput } from './dto/update-cloth.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlAbacGuard } from '../permissions/guards/gql-abac.guard';
import { RequiredPermission } from '../permissions/decorators/abac.decorator';

@Resolver(() => Cloth)
export class ClothsResolver {
  constructor(private clothsService: ClothsService) {}

  @Query(() => [Cloth])
  async cloths(): Promise<Cloth[]> {
    return this.clothsService.findAll();
  }

  @Query(() => Cloth)
  async cloth(@Args('id', { type: () => Int }) id: number): Promise<Cloth> {
    return this.clothsService.findOne(id);
  }

  @Mutation(() => Cloth)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('create', 'cloths')
  async createCloth(@Args('createClothInput') createClothInput: CreateClothInput): Promise<Cloth> {
    return this.clothsService.create(createClothInput);
  }

  @Mutation(() => Cloth)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('update', 'cloths')
  async updateCloth(@Args('updateClothInput') updateClothInput: UpdateClothInput): Promise<Cloth> {
    return this.clothsService.update(updateClothInput.id, updateClothInput);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('delete', 'cloths')
  async deleteCloth(@Args('id', { type: () => Int }) id: number): Promise<string> {
    const result = await this.clothsService.delete(id);
    return result.message;
  }
}
