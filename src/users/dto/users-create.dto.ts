import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../users.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  email: string;    

  @ApiProperty({ example: true, description: 'Is active' })
  isActive?: boolean;

  @ApiProperty({ example: 'securepassword', description: 'Password' })
  password: string;

  @ApiProperty({ example: 'Consultor', description: 'User role', enum: ['Coordinador', 'Auxiliar', 'Consultor'], default: 'Consultor' })
  role: UserRole;
}