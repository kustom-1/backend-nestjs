import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/users.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  access_token: string;

  @Field(() => User)
  user: User;
}
