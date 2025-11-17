
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post()
  @ApiOperation({ summary: 'User login', description: 'Authenticate user and get JWT token' })
  @ApiBody({ type: AuthUserDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns access token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signIn(@Body() signInDto: AuthUserDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }


}
