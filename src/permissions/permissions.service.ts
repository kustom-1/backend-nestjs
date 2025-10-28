import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { RolePermission } from './role-permission.entity';
import { UserRole } from 'src/users/users.entity';

@Injectable()
export class PermissionsService {
  constructor(
    private storageService: StorageService,
  ) {}

  /**
   * Verifica si un usuario tiene acceso a un recurso específico
   * @param userId - ID del usuario
   * @param resource - Recurso a verificar (ej: 'users', 'documents', 'files')
   * @param action - Acción a verificar (ej: 'create', 'read', 'update', 'delete')
   * @param context - Contexto adicional para verificación (ej: ownership)
   * @param userRole - Rol del usuario
   * @returns true si tiene acceso, false en caso contrario
   */
  async checkAccess(
    userId: number,
    resource: string,
    action: string,
    context: Record<string, any> = {},
    userRole?: UserRole
  ): Promise<boolean> {
    try {
      // 1. Verificar ownership del recurso (prioridad máxima)
      // Si el usuario es dueño del recurso, tiene acceso automático
      if (context.resourceOwnerId && context.resourceOwnerId === userId) {
        console.log(`✅ Access granted: User ${userId} owns the resource`);
        return true;
      }

      // 2. Verificar permisos por rol (RolePermission)
      if (userRole) {
        const rolePermissionsRepository = this.storageService.getRepository(RolePermission);
        const rolePermission = await rolePermissionsRepository.findOne({
          where: { 
            role: userRole, 
            resource, 
            action, 
            isActive: true, 
            effect: 'allow' 
          }
        });

        if (rolePermission && this.evaluateConditions(rolePermission.conditions || {}, context)) {
          console.log(`✅ Access granted: Role ${userRole} has permission ${action}:${resource}`);
          return true;
        }
      }

      console.log(`❌ Access denied: No permission found for user ${userId}, role ${userRole}, action ${action}:${resource}`);
      return false; // Denegar por defecto
    } catch (error) {
      console.error('❌ Error checking access:', error);
      return false;
    }
  }

  /**
   * Evalúa si las condiciones del permiso coinciden con el contexto
   * @param conditions - Condiciones definidas en el permiso
   * @param context - Contexto actual de la petición
   * @returns true si todas las condiciones se cumplen
   */
  private evaluateConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    // Si no hay condiciones, se considera válido
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Verificar que todas las condiciones se cumplan
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        console.log(`❌ Condition failed: ${key} expected ${value}, got ${context[key]}`);
        return false;
      }
    }
    
    return true;
  }
}