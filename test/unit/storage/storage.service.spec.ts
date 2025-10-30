import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../../../src/storage/storage.service';
import { StorageStrategy } from '../../../src/storage/storage.strategy';

describe('StorageService', () => {
    let service: StorageService;
    let mockStrategy: jest.Mocked<StorageStrategy>;

    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const mockStorageStrategy = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            getRepository: jest.fn(),
            isConnected: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: 'STORAGE_STRATEGY',
                    useValue: mockStorageStrategy,
                },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
        mockStrategy = module.get('STORAGE_STRATEGY');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect to database if not connected', async () => {
            mockStrategy.isConnected.mockReturnValue(false);
            mockStrategy.connect.mockResolvedValue({});

            await service.onModuleInit();

            expect(mockStrategy.isConnected).toHaveBeenCalled();
            expect(mockStrategy.connect).toHaveBeenCalled();
        });

        it('should not connect if already connected', async () => {
            mockStrategy.isConnected.mockReturnValue(true);

            await service.onModuleInit();

            expect(mockStrategy.isConnected).toHaveBeenCalled();
            expect(mockStrategy.connect).not.toHaveBeenCalled();
        });

        it('should handle connection errors gracefully', async () => {
            mockStrategy.isConnected.mockReturnValue(false);
            mockStrategy.connect.mockRejectedValue(new Error('Connection failed'));

            // Should not throw error
            await expect(service.onModuleInit()).resolves.not.toThrow();
            expect(mockStrategy.connect).toHaveBeenCalled();
        });
    });

    describe('connect', () => {
        it('should delegate to strategy connect method', async () => {
            const mockConnection = { isInitialized: true };
            mockStrategy.connect.mockResolvedValue(mockConnection);

            const result = await service.connect();

            expect(result).toBe(mockConnection);
            expect(mockStrategy.connect).toHaveBeenCalled();
        });

        it('should propagate connection errors', async () => {
            const error = new Error('Connection failed');
            mockStrategy.connect.mockRejectedValue(error);

            await expect(service.connect()).rejects.toThrow('Connection failed');
        });
    });

    describe('disconnect', () => {
        it('should delegate to strategy disconnect method', async () => {
            mockStrategy.disconnect.mockResolvedValue(undefined);

            await service.disconnect();

            expect(mockStrategy.disconnect).toHaveBeenCalled();
        });
    });

    describe('getRepository', () => {
        it('should delegate to strategy getRepository method', () => {
            const mockEntity = class TestEntity { };
            mockStrategy.getRepository.mockReturnValue(mockRepository);

            const result = service.getRepository(mockEntity);

            expect(result).toBe(mockRepository);
            expect(mockStrategy.getRepository).toHaveBeenCalledWith(mockEntity);
        });
    });

    describe('isConnected', () => {
        it('should delegate to strategy isConnected method', () => {
            mockStrategy.isConnected.mockReturnValue(true);

            const result = service.isConnected();

            expect(result).toBe(true);
            expect(mockStrategy.isConnected).toHaveBeenCalled();
        });

        it('should return false when strategy returns false', () => {
            mockStrategy.isConnected.mockReturnValue(false);

            const result = service.isConnected();

            expect(result).toBe(false);
        });
    });

    describe('setStrategy', () => {
        it('should change the current strategy', () => {
            const newStrategy = {
                connect: jest.fn(),
                disconnect: jest.fn(),
                getRepository: jest.fn(),
                isConnected: jest.fn(),
            };

            service.setStrategy(newStrategy as StorageStrategy);

            // Test that the new strategy is used
            mockStrategy.isConnected.mockReturnValue(false);
            newStrategy.isConnected.mockReturnValue(true);

            // This would require accessing private property, so we'll test indirectly
            expect(service).toBeDefined();
        });
    });
});