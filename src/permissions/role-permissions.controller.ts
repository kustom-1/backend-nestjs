import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsInitializerService } from './permissions-initializer.service';
import { StorageService } from '../storage/storage.service';
import { RolePermission } from './role-permission.entity';
import { UserRole } from '../users/users.entity';
import { AbacGuard } from './guards/abac.guard';
import { AuthGuard } from '@nestjs/passport'; // ← Importa esto
import { RequiredPermission } from './decorators/abac.decorator';

@ApiTags('Role Permissions')
@ApiBearerAuth()
@Controller('role-permissions')
@UseGuards(AuthGuard('jwt'), AbacGuard)
export class RolePermissionsController {
  constructor(
    private permissionsInitializerService: PermissionsInitializerService,
    private storageService: StorageService
  ) { }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los permisos por rol' })
  @ApiResponse({ status: 200, description: 'Lista de permisos por rol' })
  @RequiredPermission('read', 'role_permissions')
  async getAllRolePermissions(
    @Query('role') role?: UserRole,
    @Query('resource') resource?: string,
    @Query('action') action?: string
  ) {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);

    const where: any = { isActive: true };
    if (role) where.role = role;
    if (resource) where.resource = resource;
    if (action) where.action = action;

    const permissions = await rolePermissionRepo.find({
      where,
      order: { role: 'ASC', resource: 'ASC', action: 'ASC' }
    });

    return {
      success: true,
      data: permissions,
      total: permissions.length
    };
  }

  @Get('by-role/:role')
  @ApiOperation({ summary: 'Obtener permisos de un rol específico' })
  @ApiResponse({ status: 200, description: 'Permisos del rol' })
  @RequiredPermission('read', 'role_permissions')
  async getPermissionsByRole(@Param('role') role: UserRole) {
    const permissions = await this.permissionsInitializerService.getPermissionsForRole(role);
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);

    const detailedPermissions = await rolePermissionRepo.find({
      where: { role, isActive: true },
      order: { resource: 'ASC', action: 'ASC' }
    });

    return {
      success: true,
      role,
      permissions: permissions,
      detailedPermissions,
      total: permissions.length
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo permiso por rol' })
  @ApiResponse({ status: 201, description: 'Permiso creado exitosamente' })
  @RequiredPermission('create', 'role_permissions')
  async createRolePermission(@Body() createData: {
    role: UserRole;
    resource: string;
    action: string;
    description?: string;
    conditions?: Record<string, any>;
  }) {
    // Verificar si ya existe
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);
    const existing = await rolePermissionRepo.findOne({
      where: {
        role: createData.role,
        resource: createData.resource,
        action: createData.action,
        isActive: true
      }
    });

    if (existing) {
      return {
        success: false,
        message: 'El permiso ya existe para este rol',
        data: existing
      };
    }

    const permission = await this.permissionsInitializerService.addRolePermission(
      createData.role,
      createData.resource,
      createData.action,
      createData.description,
      createData.conditions || {}
    );

    return {
      success: true,
      message: 'Permiso creado exitosamente',
      data: permission
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un permiso por rol' })
  @ApiResponse({ status: 200, description: 'Permiso actualizado exitosamente' })
  @RequiredPermission('update', 'role_permissions')
  async updateRolePermission(
    @Param('id') id: number,
    @Body() updateData: Partial<RolePermission>
  ) {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);

    const permission = await rolePermissionRepo.findOne({
      where: { id, isActive: true }
    });

    if (!permission) {
      return {
        success: false,
        message: 'Permiso no encontrado'
      };
    }

    Object.assign(permission, updateData);
    const updated = await rolePermissionRepo.save(permission);

    return {
      success: true,
      message: 'Permiso actualizado exitosamente',
      data: updated
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un permiso por rol' })
  @ApiResponse({ status: 200, description: 'Permiso eliminado exitosamente' })
  @RequiredPermission('delete', 'role_permissions')
  async deleteRolePermission(@Param('id') id: number) {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);

    const permission = await rolePermissionRepo.findOne({
      where: { id, isActive: true }
    });

    if (!permission) {
      return {
        success: false,
        message: 'Permiso no encontrado'
      };
    }

    permission.isActive = false;
    await rolePermissionRepo.save(permission);

    return {
      success: true,
      message: 'Permiso eliminado exitosamente'
    };
  }

  @Post('check')
  @ApiOperation({ summary: 'Verificar si un rol tiene un permiso específico' })
  @ApiResponse({ status: 200, description: 'Resultado de la verificación' })
  @RequiredPermission('read', 'role_permissions')
  async checkRolePermission(@Body() checkData: {
    role: UserRole;
    resource: string;
    action: string;
  }) {
    const hasPermission = await this.permissionsInitializerService.roleHasPermission(
      checkData.role,
      checkData.resource,
      checkData.action
    );

    return {
      success: true,
      role: checkData.role,
      resource: checkData.resource,
      action: checkData.action,
      hasPermission
    };
  }

  @Get('resources')
  @ApiOperation({ summary: 'Obtener lista de recursos disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de recursos' })
  @RequiredPermission('read', 'role_permissions')
  async getAvailableResources() {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);

    const resources = await rolePermissionRepo
      .createQueryBuilder('rp')
      .select('DISTINCT rp.resource', 'resource')
      .where('rp.isActive = :isActive', { isActive: true })
      .getRawMany();

    return {
      success: true,
      data: resources.map(r => r.resource)
    };
  }

  @Get('actions')
  @ApiOperation({ summary: 'Obtener lista de acciones disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de acciones' })
  @RequiredPermission('read', 'role_permissions')
  async getAvailableActions() {
    const rolePermissionRepo = this.storageService.getRepository(RolePermission);

    const actions = await rolePermissionRepo
      .createQueryBuilder('rp')
      .select('DISTINCT rp.action', 'action')
      .where('rp.isActive = :isActive', { isActive: true })
      .getRawMany();

    return {
      success: true,
      data: actions.map(a => a.action)
    };
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Inicializar permisos por rol manualmente' })
  @ApiResponse({ status: 200, description: 'Permisos inicializados exitosamente' })
  @RequiredPermission('create', 'role_permissions')
  async initializeRolePermissions() {
    try {
      await this.permissionsInitializerService.forceInitializeRolePermissions();
      return {
        success: true,
        message: 'Role permissions initialized successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to initialize role permissions',
        error: error.message
      };
    }
  }
} 