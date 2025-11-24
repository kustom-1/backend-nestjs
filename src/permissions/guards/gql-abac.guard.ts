import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionsService } from '../permissions.service';

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
      console.log('No user found in GraphQL request');
      return false;
    }

    const { resource, action } = this.getRequiredPermission(context);
    const checkOwnership = this.getCheckOwnership(context);

    console.log('User:', { id: user.id, role: user.role });
    console.log('Required permission:', { resource, action });
    console.log('Check ownership:', checkOwnership);

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
        console.log('Resource owner ID:', resourceOwnerId);
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

    console.log('Access granted:', hasAccess);
    return hasAccess;
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
