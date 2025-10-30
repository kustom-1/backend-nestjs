import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { RolePermission } from './role-permission.entity';
import { UserRole } from '../users/users.entity';

@Injectable()
export class PermissionsInitializerService implements OnApplicationBootstrap {
  constructor(private storageService: StorageService) { }

  async onApplicationBootstrap() {
    try {
      // Esperar a que la conexión esté establecida antes de inicializar permisos
      await this.waitForDatabaseConnection();
      await this.initializeRolePermissions();
    } catch (error) {
      console.error('Failed to initialize role permissions during application bootstrap:', error);
      // No lanzar el error para permitir que la aplicación continúe iniciando
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

      // Definir permisos por defecto basados en los controladores existentes
      // Recursos detectados (basado en los controladores actuales):
      // cloths, categories, designs, images, carts, custom_images, cart_design,
      // stocks, addresses, order, transactions, design_history, users
      const resources = [
        'cloths',
        'categories',
        'designs',
        'images',
        'carts',
        'custom_images',
        'cart_design',
        'stocks',
        'addresses',
        'order',
        'transactions',
        'design_history',
        'users',
        'role_permissions'
      ];

      // Actions we support from controllers: create, read, update, delete
      const crudActions = ['create', 'read', 'update', 'delete'];

      const defaultRolePermissions = [] as Array<{
        role: UserRole;
        resource: string;
        action: string;
        description?: string;
      }>;

      // COORDINADOR: acceso completo a todos los recursos
      for (const resource of resources) {
        for (const action of crudActions) {
          defaultRolePermissions.push({
            role: UserRole.COORDINADOR,
            resource,
            action,
            description: `${action} ${resource}`,
          });
        }
      }

      // AUXILIAR: permisos de gestión para la mayoría de recursos (excepto gestión de roles/users avanzados)
      const auxiliarManaged = resources.filter(r => r !== 'users' && r !== 'role_permissions');
      for (const resource of auxiliarManaged) {
        for (const action of crudActions) {
          defaultRolePermissions.push({
            role: UserRole.AUXILIAR,
            resource,
            action,
            description: `${action} ${resource}`,
          });
        }
      }

      // CONSULTOR: solo lectura en todos los recursos
      for (const resource of resources) {
        defaultRolePermissions.push({
          role: UserRole.CONSULTOR,
          resource,
          action: 'read',
          description: `Consultar ${resource}`,
        });
      }

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