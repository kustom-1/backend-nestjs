import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto } from './dto/users-create.dto';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { ConditionalUserCreationGuard } from '../permissions/guards/conditional-user-creation.guard';
import { Action, Resource } from '../permissions/decorators/abac.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('users')
  @Action('read')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users. Requires authentication and read permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users successfully retrieved',
    type: [User],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID. No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'User found and returned',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(ConditionalUserCreationGuard)
  @Resource('users')
  @Action('create')
  @ApiOperation({
    summary: 'Create a new user',
    description: `
Creates a new user account with conditional authentication requirements based on the role:

**No Authentication Required:**
- \`Consultor\` role: Can be created without authentication (public registration)

**Authentication Required:**
- \`Auxiliar\` role: Requires JWT token and special permissions
- \`Coordinador\` role: Requires JWT token and special permissions

For creating users with administrative roles, include the JWT token in the Authorization header.
    `,
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
    examples: {
      consultor: {
        summary: 'Register as Consultor (no auth required)',
        description: 'Public registration - no authentication needed',
        value: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          password: 'SecurePassword123!',
          role: 'Consultor',
          isActive: true,
        },
      },
      auxiliar: {
        summary: 'Create Auxiliar user (auth required)',
        description: 'Requires JWT token and permissions',
        value: {
          firstName: 'María',
          lastName: 'García',
          email: 'maria.garcia@example.com',
          password: 'SecurePassword123!',
          role: 'Auxiliar',
          isActive: true,
        },
      },
      coordinador: {
        summary: 'Create Coordinador user (auth required)',
        description: 'Requires JWT token and permissions',
        value: {
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          email: 'carlos.rodriguez@example.com',
          password: 'SecurePassword123!',
          role: 'Coordinador',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required for Auxiliar or Coordinador roles',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Authentication token required to create users with this role' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  async create(@Body() userData: CreateUserDto): Promise<User> {
    return this.usersService.create(userData);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('users')
  @Action('update')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update an existing user. Requires authentication and update permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(@Param('id') id: number, @Body() userData: Partial<User>): Promise<User> {
    return this.usersService.update(id, userData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AbacGuard)
  @Resource('users')
  @Action('delete')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete an existing user. Requires authentication and delete permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async delete(@Param('id') id: number) {
    return this.usersService.delete(id);
  }
}