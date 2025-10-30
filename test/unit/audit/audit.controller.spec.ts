import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from '../../../src/audit/audit.controller';
import { AuditService } from '../../../src/audit/audit.service';
import { AuditQueryDto } from '../../../src/audit/dto/audit-query.dto';

describe('AuditController', () => {
    let controller: AuditController;
    let service: jest.Mocked<AuditService>;

    const mockAuditLogs = {
        data: [
            {
                userId: 'user1',
                username: 'testuser',
                action: 'USER_READ',
                resource: 'users',
                status: 'SUCCESS',
                timestamp: new Date(),
            },
        ],
        pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
        },
    };

    const mockUserActivity = [
        {
            userId: 'user1',
            username: 'testuser',
            action: 'USER_READ',
            resource: 'users',
            status: 'SUCCESS',
            timestamp: new Date(),
        },
    ];

    const mockAuditStats = {
        summary: {
            totalActions: 100,
            successActions: 90,
            failedActions: 5,
            errorActions: 5,
        },
        actionsByType: [
            { _id: 'USER_READ', count: 60 },
            { _id: 'USER_UPDATE', count: 30 },
        ],
        mostActiveUsers: [
            {
                userId: 'user1',
                username: 'user1',
                activityCount: 50,
            },
        ],
    };

    beforeEach(async () => {
        const mockAuditService = {
            getAuditLogs: jest.fn(),
            getUserActivity: jest.fn(),
            getAuditStats: jest.fn(),
            getResourceHistory: jest.fn(),
            cleanOldLogs: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuditController],
            providers: [
                {
                    provide: AuditService,
                    useValue: mockAuditService,
                },
            ],
        }).compile();

        controller = module.get<AuditController>(AuditController);
        service = module.get(AuditService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAuditLogs', () => {
        it('should return audit logs with query parameters', async () => {
            const query: AuditQueryDto = {
                page: 1,
                limit: 10,
                userId: 'user1',
                action: 'USER_READ' as any,
            };

            (service.getAuditLogs as any).mockResolvedValue(mockAuditLogs);

            const result = await controller.getAuditLogs(query);

            expect(result).toEqual(mockAuditLogs);
            expect(service.getAuditLogs).toHaveBeenCalledWith(query);
        });

        it('should handle empty query parameters', async () => {
            const query: AuditQueryDto = {};

            (service.getAuditLogs as any).mockResolvedValue(mockAuditLogs);

            const result = await controller.getAuditLogs(query);

            expect(result).toEqual(mockAuditLogs);
            expect(service.getAuditLogs).toHaveBeenCalledWith(query);
        });
    });

    describe('getUserActivity', () => {
        it('should return user activity with default limit', async () => {
            const userId = 'user1';

            (service.getUserActivity as any).mockResolvedValue(mockUserActivity);

            const result = await controller.getUserActivity(userId);

            expect(result).toEqual(mockUserActivity);
            expect(service.getUserActivity).toHaveBeenCalledWith(userId, undefined);
        });

        it('should return user activity with custom limit', async () => {
            const userId = 'user1';
            const limit = 50;

            (service.getUserActivity as any).mockResolvedValue(mockUserActivity);

            const result = await controller.getUserActivity(userId, limit);

            expect(result).toEqual(mockUserActivity);
            expect(service.getUserActivity).toHaveBeenCalledWith(userId, limit);
        });
    });

    describe('getAuditStats', () => {
        it('should return audit statistics without filters', async () => {
            service.getAuditStats.mockResolvedValue(mockAuditStats);

            const result = await controller.getAuditStats();

            expect(result).toEqual(mockAuditStats);
            expect(service.getAuditStats).toHaveBeenCalledWith(undefined, undefined, undefined);
        });

        it('should return audit statistics with filters', async () => {
            const userId = 'user1';
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';

            service.getAuditStats.mockResolvedValue(mockAuditStats);

            const result = await controller.getAuditStats(userId, startDate, endDate);

            expect(result).toEqual(mockAuditStats);
            expect(service.getAuditStats).toHaveBeenCalledWith(
                userId,
                new Date(startDate),
                new Date(endDate),
            );
        });
    });

    describe('getResourceHistory', () => {
        it('should return resource history', async () => {
            const resource = 'users';
            const resourceId = 'user123';
            const mockHistory = [
                {
                    userId: 'user1',
                    username: 'testuser',
                    action: 'USER_UPDATE',
                    resource: 'users',
                    resourceId: 'user123',
                    status: 'SUCCESS',
                    timestamp: new Date(),
                },
            ];

            (service.getResourceHistory as any).mockResolvedValue(mockHistory);

            const result = await controller.getResourceHistory(resource, resourceId);

            expect(result).toEqual(mockHistory);
            expect(service.getResourceHistory).toHaveBeenCalledWith(resource, resourceId);
        });
    });

    describe('cleanOldLogs', () => {
        it('should clean old logs with default days', async () => {
            const mockResult = { deletedCount: 150 };

            service.cleanOldLogs.mockResolvedValue(mockResult as any);

            const result = await controller.cleanOldLogs();

            expect(result).toEqual(mockResult);
            expect(service.cleanOldLogs).toHaveBeenCalledWith(90);
        });

        it('should clean old logs with custom days', async () => {
            const days = 30;
            const mockResult = { deletedCount: 75 };

            service.cleanOldLogs.mockResolvedValue(mockResult as any);

            const result = await controller.cleanOldLogs(days);

            expect(result).toEqual(mockResult);
            expect(service.cleanOldLogs).toHaveBeenCalledWith(days);
        });
    });
});