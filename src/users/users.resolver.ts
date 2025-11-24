import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlAbacGuard } from '../permissions/guards/gql-abac.guard';
import { RequiredPermission } from '../permissions/decorators/abac.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('read', 'users')
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('read', 'users')
  async user(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('create', 'users')
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('update', 'users')
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, GqlAbacGuard)
  @RequiredPermission('delete', 'users')
  async deleteUser(@Args('id', { type: () => Int }) id: number): Promise<string> {
    const result = await this.usersService.delete(id);
    return result.message;
  }
}
