import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { PermissionsInitializerService } from '../../../src/permissions/permissions-initializer.service';
import { RolePermission } from '../../../src/permissions/role-permission.entity';
import { StorageService } from '../../../src/storage/storage.service';
import { UserRole } from '../../../src/users/users.entity';

describe('PermissionsInitializerService', () => {
    let service: PermissionsInitializerService;
    let mockRepo: jest.Mocked<Repository<RolePermission>>;
    let mockStorageService: jest.Mocked<StorageService>;

    const mockRolePermission: RolePermission = {
        id: 1,
        role: UserRole.COORDINADOR,
        resource: 'users',
        action: 'read',
        effect: 'allow',
        isActive: true,
        conditions: {},
        description: 'read users',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const mockRepository = {
            count: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockStorageServiceValue = {
            connect: jest.fn().mockResolvedValue(undefined),
            isConnected: jest.fn().mockReturnValue(true),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionsInitializerService,
                {
                    provide: StorageService,
                    useValue: mockStorageServiceValue,
                },
            ],
        }).compile();

        service = module.get<PermissionsInitializerService>(PermissionsInitializerService);
        mockRepo = mockRepository as any;
        mockStorageService = mockStorageServiceValue as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('onApplicationBootstrap', () => {
        it('should initialize permissions when database is connected and no permissions exist', async () => {
            mockRepo.count.mockResolvedValue(0);
            mockRepo.create.mockReturnValue(mockRolePermission as any);
            mockRepo.save.mockResolvedValue(mockRolePermission);

            await service.onApplicationBootstrap();

            expect(mockStorageService.isConnected).toHaveBeenCalled();
            expect(mockRepo.count).toHaveBeenCalled();
            expect(mockRepo.create).toHaveBeenCalled();
            expect(mockRepo.save).toHaveBeenCalled();
        });

        it('should skip initialization when permissions already exist', async () => {
            mockRepo.count.mockResolvedValue(5);

            await service.onApplicationBootstrap();

            expect(mockRepo.count).toHaveBeenCalled();
            expect(mockRepo.create).not.toHaveBeenCalled();
            expect(mockRepo.save).not.toHaveBeenCalled();
        });

        it('should handle database connection errors gracefully', async () => {
            mockStorageService.isConnected.mockReturnValue(false);
            mockStorageService.connect.mockRejectedValue(new Error('Connection failed'));

            // Should not throw error
            await expect(service.onApplicationBootstrap()).resolves.not.toThrow();
        }, 15000);
    });

    describe('waitForDatabaseConnection', () => {
        it('should return immediately when database is connected', async () => {
            mockStorageService.isConnected.mockReturnValue(true);

            await expect(service['waitForDatabaseConnection']()).resolves.toBeUndefined();
            expect(mockStorageService.isConnected).toHaveBeenCalled();
        });

        it('should establish connection when not connected', async () => {
            mockStorageService.isConnected.mockReturnValueOnce(false).mockReturnValueOnce(true);
            mockStorageService.connect.mockResolvedValue(undefined);

            await expect(service['waitForDatabaseConnection']()).resolves.toBeUndefined();
            expect(mockStorageService.connect).toHaveBeenCalled();
        });

        it('should retry connection up to maxRetries times', async () => {
            mockStorageService.isConnected.mockReturnValue(false);
            mockStorageService.connect.mockRejectedValue(new Error('Connection failed'));

            await expect(service['waitForDatabaseConnection'](3, 1)).rejects.toThrow('Failed to establish database connection');
            expect(mockStorageService.connect).toHaveBeenCalledTimes(3);
        });
    });

    describe('initializeRolePermissions', () => {
        it('should create default role permissions for all roles and resources', async () => {
            mockRepo.count.mockResolvedValue(0);
            mockRepo.create.mockReturnValue(mockRolePermission as any);
            mockRepo.save.mockResolvedValue(mockRolePermission);

            await service['initializeRolePermissions']();

            expect(mockRepo.count).toHaveBeenCalled();
            expect(mockRepo.create).toHaveBeenCalled();
            expect(mockRepo.save).toHaveBeenCalled();
        });

        it('should throw error when database is not connected', async () => {
            mockStorageService.isConnected.mockReturnValue(false);

            await expect(service['initializeRolePermissions']()).rejects.toThrow('Database connection not available');
        });

        it('should handle database errors during permission creation', async () => {
            mockRepo.count.mockResolvedValue(0);
            mockRepo.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(service['initializeRolePermissions']()).rejects.toThrow('Database error');
        });
    });

    describe('addRolePermission', () => {
        it('should create and save a new role permission', async () => {
            const permissionData = {
                role: UserRole.CONSULTOR,
                resource: 'designs',
                action: 'read',
                description: 'Consultar diseños',
                conditions: { department: 'IT' },
            };

            mockRepo.create.mockReturnValue(mockRolePermission as any);
            mockRepo.save.mockResolvedValue(mockRolePermission);

            const result = await service.addRolePermission(
                permissionData.role,
                permissionData.resource,
                permissionData.action,
                permissionData.description,
                permissionData.conditions
            );

            expect(result).toEqual(mockRolePermission);
            expect(mockRepo.create).toHaveBeenCalledWith({
                ...permissionData,
                effect: 'allow',
                isActive: true,
            });
            expect(mockRepo.save).toHaveBeenCalledWith(mockRolePermission);
        });
    });

    describe('getPermissionsForRole', () => {
        it('should return formatted permissions for a role', async () => {
            const permissions = [
                { ...mockRolePermission, action: 'read', resource: 'users' },
                { ...mockRolePermission, action: 'create', resource: 'designs' },
            ];

            mockRepo.find.mockResolvedValue(permissions as any);

            const result = await service.getPermissionsForRole(UserRole.COORDINADOR);

            expect(result).toEqual(['read:users', 'create:designs']);
            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { role: UserRole.COORDINADOR, isActive: true, effect: 'allow' }
            });
        });

        it('should return empty array when role has no permissions', async () => {
            mockRepo.find.mockResolvedValue([]);

            const result = await service.getPermissionsForRole(UserRole.CONSULTOR);

            expect(result).toEqual([]);
        });
    });

    describe('roleHasPermission', () => {
        it('should return true when role has the specific permission', async () => {
            mockRepo.findOne.mockResolvedValue(mockRolePermission);

            const result = await service.roleHasPermission(UserRole.COORDINADOR, 'users', 'read');

            expect(result).toBe(true);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: {
                    role: UserRole.COORDINADOR,
                    resource: 'users',
                    action: 'read',
                    isActive: true,
                    effect: 'allow'
                }
            });
        });

        it('should return false when role does not have the permission', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            const result = await service.roleHasPermission(UserRole.CONSULTOR, 'users', 'delete');

            expect(result).toBe(false);
        });
    });

    describe('forceInitializeRolePermissions', () => {
        it('should force initialization of role permissions', async () => {
            mockStorageService.isConnected.mockReturnValue(true);
            mockRepo.count.mockResolvedValue(0);
            mockRepo.create.mockReturnValue(mockRolePermission as any);
            mockRepo.save.mockResolvedValue(mockRolePermission);

            await service.forceInitializeRolePermissions();

            expect(mockStorageService.isConnected).toHaveBeenCalled();
            expect(mockRepo.count).toHaveBeenCalled();
            expect(mockRepo.create).toHaveBeenCalled();
        });
    });
});