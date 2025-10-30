import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionsController } from '../../../src/permissions/role-permissions.controller';
import { PermissionsInitializerService } from '../../../src/permissions/permissions-initializer.service';
import { StorageService } from '../../../src/storage/storage.service';
import { RolePermission } from '../../../src/permissions/role-permission.entity';
import { UserRole } from '../../../src/users/users.entity';
import { mockRepository } from '../setup';

// Mock guards and decorators to avoid dependency issues
jest.mock('../../../src/permissions/guards/abac.guard', () => ({
    AbacGuard: class MockAbacGuard { },
}));

jest.mock('../../../src/permissions/decorators/abac.decorator', () => ({
    RequiredPermission: () => jest.fn(),
}));

describe('RolePermissionsController', () => {
    let controller: RolePermissionsController;
    let permissionsInitializerService: jest.Mocked<PermissionsInitializerService>;
    let storageService: jest.Mocked<StorageService>;

    const mockRolePermission: RolePermission = {
        id: 1,
        role: UserRole.CONSULTOR,
        resource: 'users',
        action: 'read',
        conditions: {},
        effect: 'allow',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Test permission',
    };

    beforeEach(async () => {
        const mockPermissionsInitializerService = {
            getPermissionsForRole: jest.fn(),
            addRolePermission: jest.fn(),
            roleHasPermission: jest.fn(),
            forceInitializeRolePermissions: jest.fn(),
        };

        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RolePermissionsController],
            providers: [
                {
                    provide: PermissionsInitializerService,
                    useValue: mockPermissionsInitializerService,
                },
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        controller = module.get<RolePermissionsController>(RolePermissionsController);
        permissionsInitializerService = module.get(PermissionsInitializerService);
        storageService = module.get(StorageService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllRolePermissions', () => {
        it('should return all role permissions without filters', async () => {
            const permissions = [mockRolePermission];
            mockRepository.find.mockResolvedValue(permissions);

            const result = await controller.getAllRolePermissions();

            expect(result).toEqual({
                success: true,
                data: permissions,
                total: permissions.length,
            });
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isActive: true },
                order: { role: 'ASC', resource: 'ASC', action: 'ASC' },
            });
        });

        it('should filter permissions by role', async () => {
            const permissions = [mockRolePermission];
            mockRepository.find.mockResolvedValue(permissions);

            const result = await controller.getAllRolePermissions(UserRole.CONSULTOR);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isActive: true, role: UserRole.CONSULTOR },
                order: { role: 'ASC', resource: 'ASC', action: 'ASC' },
            });
        });

        it('should filter permissions by resource and action', async () => {
            const permissions = [mockRolePermission];
            mockRepository.find.mockResolvedValue(permissions);

            const result = await controller.getAllRolePermissions(
                undefined,
                'users',
                'read'
            );

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isActive: true, resource: 'users', action: 'read' },
                order: { role: 'ASC', resource: 'ASC', action: 'ASC' },
            });
        });
    });

    describe('getPermissionsByRole', () => {
        it('should return permissions for a specific role', async () => {
            const permissions = ['read:users', 'create:documents'];
            const detailedPermissions = [mockRolePermission];

            permissionsInitializerService.getPermissionsForRole.mockResolvedValue(permissions);
            mockRepository.find.mockResolvedValue(detailedPermissions);

            const result = await controller.getPermissionsByRole(UserRole.CONSULTOR);

            expect(result).toEqual({
                success: true,
                role: UserRole.CONSULTOR,
                permissions,
                detailedPermissions,
                total: permissions.length,
            });
            expect(permissionsInitializerService.getPermissionsForRole).toHaveBeenCalledWith(UserRole.CONSULTOR);
        });
    });

    describe('createRolePermission', () => {
        const createData = {
            role: UserRole.CONSULTOR,
            resource: 'documents',
            action: 'create',
            description: 'Create documents',
            conditions: { department: 'IT' },
        };

        it('should create a new role permission', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            permissionsInitializerService.addRolePermission.mockResolvedValue(mockRolePermission);

            const result = await controller.createRolePermission(createData);

            expect(result).toEqual({
                success: true,
                message: 'Permiso creado exitosamente',
                data: mockRolePermission,
            });
            expect(permissionsInitializerService.addRolePermission).toHaveBeenCalledWith(
                createData.role,
                createData.resource,
                createData.action,
                createData.description,
                createData.conditions,
            );
        });

        it('should return existing permission if already exists', async () => {
            mockRepository.findOne.mockResolvedValue(mockRolePermission);

            const result = await controller.createRolePermission(createData);

            expect(result).toEqual({
                success: false,
                message: 'El permiso ya existe para este rol',
                data: mockRolePermission,
            });
            expect(permissionsInitializerService.addRolePermission).not.toHaveBeenCalled();
        });
    });

    describe('updateRolePermission', () => {
        const updateData = { description: 'Updated description' };

        it('should update a role permission', async () => {
            const updatedPermission = { ...mockRolePermission, ...updateData };
            mockRepository.findOne.mockResolvedValue(mockRolePermission);
            mockRepository.save.mockResolvedValue(updatedPermission);

            const result = await controller.updateRolePermission(1, updateData);

            expect(result).toEqual({
                success: true,
                message: 'Permiso actualizado exitosamente',
                data: updatedPermission,
            });
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should return error if permission not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await controller.updateRolePermission(999, updateData);

            expect(result).toEqual({
                success: false,
                message: 'Permiso no encontrado',
            });
        });
    });

    describe('deleteRolePermission', () => {
        it('should soft delete a role permission', async () => {
            mockRepository.findOne.mockResolvedValue(mockRolePermission);
            mockRepository.save.mockResolvedValue({ ...mockRolePermission, isActive: false });

            const result = await controller.deleteRolePermission(1);

            expect(result).toEqual({
                success: true,
                message: 'Permiso eliminado exitosamente',
            });
            expect(mockRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ isActive: false })
            );
        });

        it('should return error if permission not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await controller.deleteRolePermission(999);

            expect(result).toEqual({
                success: false,
                message: 'Permiso no encontrado',
            });
        });
    });

    describe('checkRolePermission', () => {
        const checkData = {
            role: UserRole.CONSULTOR,
            resource: 'users',
            action: 'read',
        };

        it('should check if role has permission', async () => {
            permissionsInitializerService.roleHasPermission.mockResolvedValue(true);

            const result = await controller.checkRolePermission(checkData);

            expect(result).toEqual({
                success: true,
                role: checkData.role,
                resource: checkData.resource,
                action: checkData.action,
                hasPermission: true,
            });
            expect(permissionsInitializerService.roleHasPermission).toHaveBeenCalledWith(
                checkData.role,
                checkData.resource,
                checkData.action,
            );
        });
    });

    describe('getAvailableResources', () => {
        it('should return list of available resources', async () => {
            const mockResources = [{ resource: 'users' }, { resource: 'documents' }];
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue(mockResources),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await controller.getAvailableResources();

            expect(result).toEqual({
                success: true,
                data: ['users', 'documents'],
            });
        });
    });

    describe('getAvailableActions', () => {
        it('should return list of available actions', async () => {
            const mockActions = [{ action: 'read' }, { action: 'create' }];
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue(mockActions),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await controller.getAvailableActions();

            expect(result).toEqual({
                success: true,
                data: ['read', 'create'],
            });
        });
    });

    describe('initializeRolePermissions', () => {
        it('should initialize role permissions successfully', async () => {
            permissionsInitializerService.forceInitializeRolePermissions.mockResolvedValue(undefined);

            const result = await controller.initializeRolePermissions();

            expect(result).toEqual({
                success: true,
                message: 'Role permissions initialized successfully',
            });
        });

        it('should handle initialization errors', async () => {
            const error = new Error('Initialization failed');
            permissionsInitializerService.forceInitializeRolePermissions.mockRejectedValue(error);

            const result = await controller.initializeRolePermissions();

            expect(result).toEqual({
                success: false,
                message: 'Failed to initialize role permissions',
                error: error.message,
            });
        });
    });
});