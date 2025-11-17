import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbacGuard } from './abac.guard';
import { UserRole } from '../../users/users.entity';
import { JwtService } from '@nestjs/jwt';

/**
 * Guard that conditionally applies authentication and authorization based on the user role being created.
 * - Allows creation of 'Consultor' users without authentication
 * - Requires JWT authentication and ABAC permissions for 'Auxiliar' and 'Coordinador' users
 */
@Injectable()
export class ConditionalUserCreationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abacGuard: AbacGuard,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // Get the role from the request body
    const roleToCreate = body?.role;

    // If creating a Consultor user, allow without authentication
    if (roleToCreate === UserRole.CONSULTOR || roleToCreate === 'Consultor') {
      console.log('Creating Consultor user - no authentication required');
      return true;
    }

    // For Auxiliar or Coordinador, require JWT authentication
    if (roleToCreate === UserRole.AUXILIAR || roleToCreate === 'Auxiliar' ||
        roleToCreate === UserRole.COORDINADOR || roleToCreate === 'Coordinador') {

      console.log(`Creating ${roleToCreate} user - authentication required`);

      // Extract and verify JWT token
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Authentication token required to create users with this role');
      }

      try {
        // Verify and decode the token
        const payload = await this.jwtService.verifyAsync(token);
        // Attach user to request for ABAC guard
        request.user = payload;
      } catch (error) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      // Then check ABAC permissions
      const hasPermission = await this.abacGuard.canActivate(context);

      if (!hasPermission) {
        throw new UnauthorizedException('Insufficient permissions to create users with this role');
      }

      return true;
    }

    // If no role specified or invalid role, deny access
    throw new UnauthorizedException('Invalid or missing role');
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
