import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'Password' })
  password: string;
}