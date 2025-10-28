import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { RolePermission } from './role-permission.entity';
import { UserRole } from '../users/users.entity';

@Injectable()
export class PermissionsInitializerService implements OnApplicationBootstrap {
  constructor(private storageService: StorageService) {}

  async onApplicationBootstrap() {
    try {
      // Esperar a que la conexión esté establecida antes de inicializar permisos
      await this.waitForDatabaseConnection();
      await this.initializeRolePermissions();
    } catch (error) {
      console.error('Failed to initialize role permissions during application bootstrap:', error);
      // No lanzar el error para permitir que la aplicación continúe iniciando
      // Los permisos se pueden inicializar manualmente más tarde si es necesario
    }
  }

  private async waitForDatabaseConnection(maxRetries = 10, delay = 1000): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (this.storageService.isConnected()) {
          console.log('Database connection confirmed, initializing permissions...');
          return;
        }
        
        // Intentar conectar si no está conectado
        await this.storageService.connect();
        
        if (this.storageService.isConnected()) {
          console.log('Database connection established, initializing permissions...');
          return;
        }
      } catch (error) {
        console.log(`Database connection attempt ${i + 1}/${maxRetries} failed, retrying...`);
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    throw new Error('Failed to establish database connection for permissions initialization');
  }

  private async initializeRolePermissions() {
    try {
      // Verificar conexión antes de proceder
      if (!this.storageService.isConnected()) {
        throw new Error('Database connection not available');
      }

      const rolePermissionRepo = this.storageService.getRepository(RolePermission);
      
      // Verificar si ya existen permisos
      const existingPermissions = await rolePermissionRepo.count();
      if (existingPermissions > 0) {
        console.log(`Role permissions already initialized (${existingPermissions} permissions found)`);
        return;
      }

      console.log('Initializing role permissions for the first time...');

      // Definir permisos por defecto basados en los requerimientos
      const defaultRolePermissions = [
        // COORDINADOR - Acceso completo
        { role: UserRole.COORDINADOR, resource: 'users', action: 'create', description: 'Crear usuarios' },
        { role: UserRole.COORDINADOR, resource: 'users', action: 'read', description: 'Consultar usuarios' },
        { role: UserRole.COORDINADOR, resource: 'users', action: 'update', description: 'Actualizar usuarios' },
        { role: UserRole.COORDINADOR, resource: 'users', action: 'delete', description: 'Eliminar usuarios' },
        { role: UserRole.COORDINADOR, resource: 'documents', action: 'subir', description: 'Subir documentos' },
        { role: UserRole.COORDINADOR, resource: 'documents', action: 'editar', description: 'Editar documentos' },
        { role: UserRole.COORDINADOR, resource: 'documents', action: 'consultar', description: 'Consultar documentos' },
        { role: UserRole.COORDINADOR, resource: 'documents', action: 'prestar', description: 'Prestar documentos' },
        { role: UserRole.COORDINADOR, resource: 'documents', action: 'autorizar_prestamo', description: 'Autorizar préstamos' },
        { role: UserRole.COORDINADOR, resource: 'documents', action: 'eliminar', description: 'Eliminar documentos' },
        
        // AUXILIAR - Gestión de documentos completa
        { role: UserRole.AUXILIAR, resource: 'documents', action: 'subir', description: 'Subir documentos' },
        { role: UserRole.AUXILIAR, resource: 'documents', action: 'editar', description: 'Editar documentos' },
        { role: UserRole.AUXILIAR, resource: 'documents', action: 'consultar', description: 'Consultar documentos' },
        { role: UserRole.AUXILIAR, resource: 'documents', action: 'prestar', description: 'Prestar documentos' },
        { role: UserRole.AUXILIAR, resource: 'documents', action: 'autorizar_prestamo', description: 'Autorizar préstamos' },
        { role: UserRole.AUXILIAR, resource: 'documents', action: 'eliminar', description: 'Eliminar documentos' },
        
        // CONSULTOR - Solo consulta
        { role: UserRole.CONSULTOR, resource: 'documents', action: 'consultar', description: 'Consultar documentos' },
      ];

      // Crear permisos en la BD
      for (const permissionData of defaultRolePermissions) {
        const rolePermission = rolePermissionRepo.create({
          ...permissionData,
          effect: 'allow',
          isActive: true,
          conditions: {}
        });
        await rolePermissionRepo.save(rolePermission);
      }

      console.log(`Role permissions initialized successfully (${defaultRolePermissions.length} permissions created)`);
    } catch (error) {
      console.error('Error initializing role permissions:', error);
      throw error; // Re-lanzar el error para que se maneje en el nivel superior
    }
  }

  // Método para agregar nuevos permisos por rol
  async addRolePermission(
    role: UserRole,
    resource: string,
    action: string,
    description?: string,
    conditions: Record<string, any> = {}
  ): Promise<RolePermission> {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);
    
    const rolePermission = rolePermissionRepo.create({
      role,
      resource,
      action,
      description,
      conditions,
      effect: 'allow',
      isActive: true
    });

    return await rolePermissionRepo.save(rolePermission);
  }

  // Método para obtener permisos de un rol
  async getPermissionsForRole(role: UserRole): Promise<string[]> {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);
    
    const permissions = await rolePermissionRepo.find({
      where: { role, isActive: true, effect: 'allow' }
    });

    return permissions.map(p => `${p.action}:${p.resource}`);
  }

  // Método para verificar si un rol tiene un permiso específico
  async roleHasPermission(role: UserRole, resource: string, action: string): Promise<boolean> {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);
    
    const permission = await rolePermissionRepo.findOne({
      where: { 
        role, 
        resource, 
        action, 
        isActive: true, 
        effect: 'allow' 
      }
    });

    return !!permission;
  }

  // Método público para inicializar permisos manualmente
  async forceInitializeRolePermissions(): Promise<void> {
    console.log('Forcing role permissions initialization...');
    await this.waitForDatabaseConnection();
    await this.initializeRolePermissions();
  }
} 