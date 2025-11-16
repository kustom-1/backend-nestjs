import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root endpoint', description: 'Welcome message' })
  @ApiResponse({ status: 200, description: 'Returns welcome message' })
  getHello(): string {
    return 'Hello World!';
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check', description: 'Check if the API is running' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
