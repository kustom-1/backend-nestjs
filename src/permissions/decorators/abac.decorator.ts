import { SetMetadata } from '@nestjs/common';

export const ABAC = (resource: string, action: string) =>
  SetMetadata('abac', { resource, action });

export const Resource = (resource: string) => SetMetadata('resource', resource);
export const Action = (action: string) => SetMetadata('action', action);

// Decorador para especificar el campo que contiene el ID del propietario del recurso
export const ResourceOwnerField = (field: string) => SetMetadata('resourceOwnerField', field);

// Decorador para especificar que se debe verificar ownership
export const CheckOwnership = () => SetMetadata('checkOwnership', true);

// Decorador combinado para facilitar el uso
export const RequiredPermission = (action: string, resource: string) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Resource(resource)(target, propertyKey, descriptor);
    Action(action)(target, propertyKey, descriptor);
  };
};

// Decorador combinado para permisos con verificación de ownership
export const RequiredPermissionWithOwnership = (
  action: string, 
  resource: string, 
  ownerField: string = 'userId'
) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Resource(resource)(target, propertyKey, descriptor);
    Action(action)(target, propertyKey, descriptor);
    ResourceOwnerField(ownerField)(target, propertyKey, descriptor);
    CheckOwnership()(target, propertyKey, descriptor);
  };
};