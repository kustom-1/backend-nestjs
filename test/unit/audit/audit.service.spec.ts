import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditService } from '../../../src/audit/audit.service';
import { Audit, AuditAction, AuditStatus } from '../../../src/audit/audit.schema';
import { CreateAuditDto } from '../../../src/audit/dto/create-audit.dto';
import { AuditQueryDto } from '../../../src/audit/dto/audit-query.dto';

describe('AuditService', () => {
    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    let service: AuditService;
    let AuditModelMock: jest.Mock & {
        find: jest.Mock;
        findOne: jest.Mock;
        countDocuments: jest.Mock;
        aggregate: jest.Mock;
        deleteMany: jest.Mock;
        create: jest.Mock; // por si en el futuro cambias a .create()
    };

    const baseAudit: Audit = {
        userId: 'user123',
        username: 'testuser',
        action: AuditAction.USER_READ,
        resource: 'users',
        resourceId: 'user456',
        status: AuditStatus.SUCCESS,
        method: 'GET',
        endpoint: '/users/user456',
        ip: '192.168.1.1',
        timestamp: new Date(),
        requestBody: { someData: 'value' },
        responseData: { user: { id: 'user456', name: 'Test User' } },
        metadata: { filters: { active: true }, affectedRecords: 1 },
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123',
        duration: 150,
    };

    beforeEach(async () => {
        // Constructor (para "new this.auditModel(doc)")
        AuditModelMock = jest.fn() as any;

        // ----- Cadenas de consulta comunes -----
        const makeFindChain = (resolvedValue: any) => ({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(resolvedValue),
        });

        // Métodos estáticos
        AuditModelMock.find = jest.fn().mockReturnValue(makeFindChain([]));
        AuditModelMock.findOne = jest.fn();
        AuditModelMock.countDocuments = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(0),
        });
        AuditModelMock.aggregate = jest.fn().mockResolvedValue([]);
        // deleteMany en tu servicio se usa SIN .exec(), así que devolvemos una promesa directamente
        AuditModelMock.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
        AuditModelMock.create = jest.fn(); // no lo usamos aquí, pero queda por compatibilidad

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditService,
                {
                    provide: getModelToken(Audit.name),
                    useValue: AuditModelMock, // 👈 ahora es constructible
                },
            ],
        }).compile();

        service = module.get<AuditService>(AuditService);
    });


    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAuditLog', () => {
        it('should create audit log successfully', async () => {
            const createAuditDto: CreateAuditDto = {
                userId: 'user123',
                username: 'testuser',
                action: AuditAction.USER_READ,
                resource: 'users',
                status: AuditStatus.SUCCESS,
                method: 'GET',
                endpoint: '/users/user456',
                ip: '192.168.1.1',
                requestBody: { password: 'secret', token: 'token123' },
            };

            const savedAudit = { ...baseAudit, _id: 'audit123' };

            // Definimos qué pasa cuando se hace "new AuditModelMock(doc)"
            (AuditModelMock as jest.Mock).mockImplementation(function (doc) {
                return {
                    ...doc,
                    save: jest.fn().mockResolvedValue(savedAudit), // lo que usará el servicio
                };
            });

            const result = await service.createAuditLog(createAuditDto);

            expect(result).toEqual(savedAudit);
            expect(AuditModelMock).toHaveBeenCalledTimes(1); // se llamó el constructor
        });


        it('should sanitize sensitive data', async () => {
            const createAuditDto: CreateAuditDto = {
                userId: 'user123',
                username: 'testuser',
                action: AuditAction.USER_CREATE,
                resource: 'users',
                status: AuditStatus.SUCCESS,
                method: 'POST',
                endpoint: '/users',
                ip: '192.168.1.1',
                requestBody: {
                    password: 'secret',
                    token: 'token123',
                    accessToken: 'access123',
                    refreshToken: 'refresh123',
                    normalField: 'normal',
                },
            };

            let receivedDoc: any;
            // Cuando el servicio haga "new AuditModelMock(doc)", capturamos el doc
            (AuditModelMock as jest.Mock).mockImplementation((doc) => {
                receivedDoc = doc;
                return {
                    ...doc,
                    save: jest.fn().mockResolvedValue({ ...doc, _id: 'audit123' }),
                };
            });

            const result = await service.createAuditLog(createAuditDto);

            // Verifica que se eliminó lo sensible y se mantuvo lo normal
            expect(receivedDoc.requestBody).toEqual({ normalField: 'normal' });
            // Verifica que agregó timestamp
            expect(receivedDoc.timestamp).toBeInstanceOf(Date);
        });


        it('should handle errors gracefully', async () => {
            const createAuditDto: CreateAuditDto = {
                userId: 'user123',
                username: 'testuser',
                action: AuditAction.USER_READ,
                resource: 'users',
                status: AuditStatus.SUCCESS,
                method: 'GET',
                endpoint: '/users',
                ip: '192.168.1.1',
            };

            // Haz que el "constructor" lance
            (AuditModelMock as jest.Mock).mockImplementation(() => {
                throw new Error('Database error');
            });

            const result = await service.createAuditLog(createAuditDto);

            expect(result).toBeNull();
        });

    });

    describe('getAuditLogs', () => {
        it('should return paginated audit logs', async () => {
            const query: AuditQueryDto = {
                page: 1,
                limit: 10,
                userId: 'user123',
                action: AuditAction.USER_READ,
            };

            const mockLogs = [baseAudit];

            // Cadena de consulta que devolverá logs
            const chain = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockLogs),
            };
            AuditModelMock.find.mockReturnValue(chain as any);

            // countDocuments debe devolver un objeto con exec()
            AuditModelMock.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(1),
            });

            const result = await service.getAuditLogs(query);

            expect(result.data).toEqual(mockLogs);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.totalPages).toBe(1);
            expect(AuditModelMock.find).toHaveBeenCalledWith({
                userId: 'user123',
                action: AuditAction.USER_READ,
            });
        });

        it('should apply date filters', async () => {
            const query: AuditQueryDto = {
                startDate: '2025-01-01',
                endDate: '2025-01-31',
                page: 1,
                limit: 10,
            };

            const mockLogs = [baseAudit];
            const chain = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockLogs),
            };
            AuditModelMock.find.mockReturnValue(chain as any);
            AuditModelMock.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(1),
            });

            const result = await service.getAuditLogs(query);

            expect(result.data).toEqual(mockLogs);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it('should apply search query', async () => {
            const query: AuditQueryDto = { searchQuery: 'test', page: 1, limit: 10 };

            const mockLogs = [baseAudit];
            const chain = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockLogs),
            };
            AuditModelMock.find.mockReturnValue(chain as any);
            AuditModelMock.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(1),
            });

            const result = await service.getAuditLogs(query);

            expect(result.data).toEqual(mockLogs);
            expect(result.pagination.total).toBe(1);
        });
    });


    describe('getUserActivity', () => {
        it('should return user activity logs', async () => {
            const userId = 'user123';
            const limit = 50;
            const mockLogs = [baseAudit];

            const chain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockLogs),
            };

            AuditModelMock.find.mockReturnValue(chain as any);

            const result = await service.getUserActivity(userId, limit);

            expect(result).toEqual(mockLogs);
            expect(AuditModelMock.find).toHaveBeenCalledWith({ userId });
            expect(chain.limit).toHaveBeenCalledWith(limit);
        });
    });


    describe('getAuditStats', () => {
        it('should return audit statistics', async () => {
            const mockStats = [{
                totalActions: 100,
                successActions: 90,
                failedActions: 5,
                errorActions: 5,
                actionsByType: ['USER_READ', 'USER_UPDATE'],
            }];

            const mockActionsByType = [
                { _id: 'USER_READ', count: 60 },
                { _id: 'USER_UPDATE', count: 30 },
            ];

            const mockMostActiveUsers = [
                { _id: { userId: 'user1', username: 'user1' }, activityCount: 50 },
            ];

            AuditModelMock.aggregate
                .mockResolvedValueOnce(mockStats)
                .mockResolvedValueOnce(mockActionsByType)
                .mockResolvedValueOnce(mockMostActiveUsers);

            const result = await service.getAuditStats();

            expect(result.summary.totalActions).toBe(100);
            expect(result.actionsByType).toEqual(mockActionsByType);
            expect(result.mostActiveUsers).toHaveLength(1);
            expect(result.mostActiveUsers[0]).toEqual({
                userId: 'user1',
                username: 'user1',
                activityCount: 50,
            });
        });
    });


    describe('getResourceHistory', () => {
        it('should return resource history', async () => {
            const resource = 'users';
            const resourceId = 'user123';
            const mockLogs = [baseAudit];

            const chain = {
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockLogs),
            };

            AuditModelMock.find.mockReturnValue(chain as any);

            const result = await service.getResourceHistory(resource, resourceId);

            expect(result).toEqual(mockLogs);
            expect(AuditModelMock.find).toHaveBeenCalledWith({ resource, resourceId });
        });
    });


    describe('cleanOldLogs', () => {
        it('should clean old logs', async () => {
            const daysToKeep = 30;
            const mockResult = { deletedCount: 150 };

            // En el servicio NO se llama .exec(), así que resolvemos directo
            AuditModelMock.deleteMany.mockResolvedValue(mockResult as any);

            const result = await service.cleanOldLogs(daysToKeep);

            expect(result).toEqual(mockResult);
            expect(AuditModelMock.deleteMany).toHaveBeenCalled();
        });
    });


    describe('sanitizeData', () => {
        it('should truncate large response data', () => {
            const largeData = 'x'.repeat(15000);
            const dto: CreateAuditDto = {
                userId: 'user123',
                username: 'testuser',
                action: AuditAction.USER_READ,
                resource: 'users',
                status: AuditStatus.SUCCESS,
                method: 'GET',
                endpoint: '/users',
                ip: '192.168.1.1',
                responseData: { data: largeData },
            };

            const result = (service as any).sanitizeData(dto);

            expect(result.responseData._truncated).toBe(true);
            expect(result.responseData._originalSize).toBeGreaterThan(10000);
        });
    });


    describe('mapEndpointToAction', () => {
        it('should map document endpoints correctly', () => {
            expect(AuditService.mapEndpointToAction('POST', '/documents')).toBe(AuditAction.DOCUMENT_CREATE);
            expect(AuditService.mapEndpointToAction('GET', '/documents')).toBe(AuditAction.DOCUMENT_READ);
            expect(AuditService.mapEndpointToAction('PUT', '/documents')).toBe(AuditAction.DOCUMENT_UPDATE);
            expect(AuditService.mapEndpointToAction('DELETE', '/documents')).toBe(AuditAction.DOCUMENT_DELETE);
        });

        it('should map user endpoints correctly', () => {
            expect(AuditService.mapEndpointToAction('POST', '/users')).toBe(AuditAction.USER_CREATE);
            expect(AuditService.mapEndpointToAction('GET', '/users')).toBe(AuditAction.USER_READ);
        });

        it('should map auth endpoints correctly', () => {
            expect(AuditService.mapEndpointToAction('POST', '/auth/login')).toBe(AuditAction.LOGIN_SUCCESS);
            expect(AuditService.mapEndpointToAction('POST', '/auth/logout')).toBe(AuditAction.LOGOUT);
        });

        it('should return OTHER for unknown endpoints', () => {
            expect(AuditService.mapEndpointToAction('GET', '/unknown')).toBe(AuditAction.OTHER);
        });
    });

    describe('extractResource', () => {
        it('should extract resource from endpoint', () => {
            expect(AuditService.extractResource('/users/123')).toBe('users');
            expect(AuditService.extractResource('/documents/search')).toBe('documents');
            expect(AuditService.extractResource('/loans')).toBe('loans');
        });

        it('should return unknown for empty path', () => {
            expect(AuditService.extractResource('/')).toBe('unknown');
        });
    });
});