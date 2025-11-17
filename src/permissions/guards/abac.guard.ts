import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      console.log('No user found in request');
      return false;
    }

    const { resource, action } = this.getRequiredPermission(context);
    const checkOwnership = this.getCheckOwnership(context);
    const ownerField = this.getResourceOwnerField(context);

    console.log('User:', { id: user.id, role: user.role });
    console.log('Required permission:', { resource, action });
    console.log('Check ownership:', checkOwnership);

    // Prepare context for verification
    const accessContext: Record<string, any> = {
      userId: user.id,
      userRole: user.role
    };

    // If required, check resource ownership
    if (checkOwnership && ownerField) {
      const resourceOwnerId = await this.getResourceOwnerId(request, ownerField, resource);
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
      user.role
    );

    console.log('Access granted:', hasAccess);
    return hasAccess;
  }

  private getRequiredPermission(context: ExecutionContext): { resource: string; action: string } {
    const handler = context.getHandler();
    const classRef = context.getClass();
    const resource = this.reflector.get<string>('resource', handler) || this.reflector.get<string>('resource', classRef);
    const action = this.reflector.get<string>('action', handler) || this.reflector.get<string>('action', classRef);

    return { resource: resource || '', action: action || '' };
  }

  private getCheckOwnership(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const classRef = context.getClass();
    return this.reflector.get<boolean>('checkOwnership', handler) ||
      this.reflector.get<boolean>('checkOwnership', classRef) ||
      false;
  }

  private getResourceOwnerField(context: ExecutionContext): string {
    const handler = context.getHandler();
    const classRef = context.getClass();
    return this.reflector.get<string>('resourceOwnerField', handler) ||
      this.reflector.get<string>('resourceOwnerField', classRef) ||
      'userId';
  }

  private async getResourceOwnerId(request: any, ownerField: string, resource: string): Promise<number | null> {
    try {
      // Get the resource ID from the URL parameters
      const resourceId = request.params.id;
      if (!resourceId) {
        console.log('No resource ID found in request params');
        return null;
      }

      // Here we would implement logic to fetch the resource and return the owner ID
      // For example, if the resource is 'documents', you would call the DocumentsService to get the document by ID
      console.log(`Getting owner for ${resource} with ID ${resourceId}, field ${ownerField}`);

      // TODO: Implementar lógica específica para obtener el owner del recurso
      // Ejemplo para documentos:
      // if (resource === 'documents') {
      //   const document = await this.documentsService.findById(resourceId);
      //   return document?.[ownerField] || null;
      // }

      return null;
    } catch (error) {
      console.error('Error getting resource owner ID:', error);
      return null;
    }
  }
}