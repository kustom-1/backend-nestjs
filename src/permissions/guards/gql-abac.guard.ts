import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionsService } from '../permissions.service';
import { ForbiddenException, UnauthorizedException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class GqlAbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Debe iniciar sesión para acceder a este recurso');
    }

    const { resource, action } = this.getRequiredPermission(context);
    
    if (!resource || !action) {
      throw new ForbiddenException('Permisos no configurados correctamente');
    }

    const checkOwnership = this.getCheckOwnership(context);

    // Prepare context for verification
    const accessContext: Record<string, any> = {
      userId: user.id,
      userRole: user.role,
    };

    // If required, check resource ownership from GraphQL args
    if (checkOwnership) {
      const args = ctx.getArgs();
      const resourceOwnerId = args.userId || args.id;
      if (resourceOwnerId) {
        accessContext.resourceOwnerId = resourceOwnerId;
      }
    }

    // Check if user has access
    const hasAccess = await this.permissionsService.checkAccess(
      user.id,
      resource,
      action,
      accessContext,
      user.role,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `No tiene permisos para realizar la acción '${action}' en '${resource}'`,
      );
    }

    return true;
  }

  private getRequiredPermission(context: ExecutionContext): {
    resource: string;
    action: string;
  } {
    const handler = context.getHandler();
    const classRef = context.getClass();
    const resource =
      this.reflector.get<string>('resource', handler) ||
      this.reflector.get<string>('resource', classRef);
    const action =
      this.reflector.get<string>('action', handler) ||
      this.reflector.get<string>('action', classRef);

    return { resource: resource || '', action: action || '' };
  }

  private getCheckOwnership(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const classRef = context.getClass();
    return (
      this.reflector.get<boolean>('checkOwnership', handler) ||
      this.reflector.get<boolean>('checkOwnership', classRef) ||
      false
    );
  }
}
