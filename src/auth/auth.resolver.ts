import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../users/dto/create-user.input';
import { AuthResponse } from './dto/auth-response.type';
import { User } from '../users/users.entity';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    const result = await this.authService.signIn(loginInput.email, loginInput.password);
    return {
      access_token: result.access_token,
      user: await this.usersService.findByEmail(loginInput.email),
    };
  }

  @Mutation(() => AuthResponse)
  async register(@Args('createUserInput') createUserInput: CreateUserInput): Promise<AuthResponse> {
    const user = await this.usersService.create(createUserInput);
    const result = await this.authService.signIn(user.email, createUserInput.password);
    return {
      access_token: result.access_token,
      user,
    };
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@Context() context): Promise<User> {
    const userId = context.req.user.id;
    return this.usersService.findOne(userId);
  }
}
