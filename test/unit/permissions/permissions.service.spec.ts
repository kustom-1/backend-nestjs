import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '../../../src/permissions/permissions.service';
import { StorageService } from '../../../src/storage/storage.service';
import { RolePermission } from '../../../src/permissions/role-permission.entity';
import { UserRole } from '../../../src/users/users.entity';
import { mockRepository } from '../setup';

describe('PermissionsService', () => {
    let service: PermissionsService;
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
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionsService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<PermissionsService>(PermissionsService);
        storageService = module.get(StorageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkAccess', () => {
        const userId = 1;
        const resource = 'users';
        const action = 'read';
        const context = { resourceOwnerId: 1 };

        it('should grant access when user owns the resource', async () => {
            const result = await service.checkAccess(userId, resource, action, context);

            expect(result).toBe(true);
        });

        it('should grant access when role has permission and conditions match', async () => {
            const userRole = UserRole.CONSULTOR;
            mockRepository.findOne.mockResolvedValue(mockRolePermission);

            const result = await service.checkAccess(userId, resource, action, {}, userRole);

            expect(result).toBe(true);
            expect(storageService.getRepository).toHaveBeenCalledWith(RolePermission);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: {
                    role: userRole,
                    resource,
                    action,
                    isActive: true,
                    effect: 'allow',
                },
            });
        });

        it('should deny access when role permission has conditions that do not match', async () => {
            const userRole = UserRole.CONSULTOR;
            const permissionWithConditions = {
                ...mockRolePermission,
                conditions: { department: 'IT' },
            };
            mockRepository.findOne.mockResolvedValue(permissionWithConditions);

            const contextWithoutMatchingCondition = { department: 'HR' };
            const result = await service.checkAccess(userId, resource, action, contextWithoutMatchingCondition, userRole);

            expect(result).toBe(false);
        });

        it('should grant access when role permission conditions match context', async () => {
            const userRole = UserRole.CONSULTOR;
            const permissionWithConditions = {
                ...mockRolePermission,
                conditions: { department: 'IT' },
            };
            mockRepository.findOne.mockResolvedValue(permissionWithConditions);

            const contextWithMatchingCondition = { department: 'IT' };
            const result = await service.checkAccess(userId, resource, action, contextWithMatchingCondition, userRole);

            expect(result).toBe(true);
        });

        it('should deny access when no permission found', async () => {
            const userRole = UserRole.CONSULTOR;
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.checkAccess(userId, resource, action, {}, userRole);

            expect(result).toBe(false);
        });

        it('should deny access when no user role provided', async () => {
            const result = await service.checkAccess(userId, resource, action, {});

            expect(result).toBe(false);
        });

        it('should deny access when error occurs', async () => {
            const userRole = UserRole.CONSULTOR;
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));

            const result = await service.checkAccess(userId, resource, action, {}, userRole);

            expect(result).toBe(false);
        });

        it('should deny access when user does not own resource and no role permission', async () => {
            const userRole = UserRole.CONSULTOR;
            const differentContext = { resourceOwnerId: 2 }; // Different owner
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.checkAccess(userId, resource, action, differentContext, userRole);

            expect(result).toBe(false);
        });
    });

    describe('evaluateConditions', () => {
        it('should return true when no conditions provided', () => {
            const conditions = {};
            const context = { anyKey: 'anyValue' };

            // Access private method through type assertion
            const result = (service as any).evaluateConditions(conditions, context);

            expect(result).toBe(true);
        });

        it('should return true when all conditions match', () => {
            const conditions = { department: 'IT', level: 'senior' };
            const context = { department: 'IT', level: 'senior', extra: 'data' };

            const result = (service as any).evaluateConditions(conditions, context);

            expect(result).toBe(true);
        });

        it('should return false when any condition does not match', () => {
            const conditions = { department: 'IT', level: 'senior' };
            const context = { department: 'IT', level: 'junior' };

            const result = (service as any).evaluateConditions(conditions, context);

            expect(result).toBe(false);
        });

        it('should return false when condition key is missing in context', () => {
            const conditions = { department: 'IT', level: 'senior' };
            const context = { department: 'IT' };

            const result = (service as any).evaluateConditions(conditions, context);

            expect(result).toBe(false);
        });
    });
});