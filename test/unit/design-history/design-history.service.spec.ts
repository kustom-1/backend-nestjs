import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { DesignHistoryService } from '../../../src/design-history/design-history.service';
import { DesignHistory } from '../../../src/design-history/design-history.entity';
import { StorageService } from '../../../src/storage/storage.service';
import { CreateDesignHistoryDto } from '../../../src/design-history/dto/create-design-history.dto';
import { UpdateDesignHistoryDto } from '../../../src/design-history/dto/update-design-history.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('DesignHistoryService', () => {
    let service: DesignHistoryService;
    let mockRepo: jest.Mocked<Repository<DesignHistory>>;
    let mockStorageService: jest.Mocked<StorageService>;

    const mockDesignHistory: DesignHistory = {
        id: 1,
        design: { id: 1 } as any,
        version: 1,
        dataSnapshot: { color: 'red', size: 'M' },
        createdAt: new Date('2023-01-01'),
        order: { id: 1 } as any,
    };

    const mockDesignHistories: DesignHistory[] = [mockDesignHistory];

    beforeEach(async () => {
        const mockRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        const mockStorageServiceValue = {
            connect: jest.fn().mockResolvedValue(undefined),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DesignHistoryService,
                {
                    provide: StorageService,
                    useValue: mockStorageServiceValue,
                },
            ],
        }).compile();

        service = module.get<DesignHistoryService>(DesignHistoryService);
        mockRepo = mockRepository as any;
        mockStorageService = mockStorageServiceValue as any;

        // Initialize the service
        await service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all design histories with relations', async () => {
            mockRepo.find.mockResolvedValue(mockDesignHistories);

            const result = await service.findAll();

            expect(result).toEqual(mockDesignHistories);
            expect(mockRepo.find).toHaveBeenCalledWith({ relations: ['design', 'order'] });
        });

        it('should return empty array when no design histories exist', async () => {
            mockRepo.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a design history when found', async () => {
            mockRepo.findOne.mockResolvedValue(mockDesignHistory);

            const result = await service.findOne(1);

            expect(result).toEqual(mockDesignHistory);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['design', 'order']
            });
        });

        it('should throw NotFoundException when design history not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        const createDto: CreateDesignHistoryDto = {
            designId: 1,
            version: 2,
            dataSnapshot: { color: 'blue', size: 'L' },
            createdAt: '2023-01-02T00:00:00.000Z',
            order: 2,
        };

        it('should create and return a design history', async () => {
            const createdEntity = { ...mockDesignHistory, version: 2 };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(createDto);

            expect(result).toEqual(createdEntity);
            expect(mockRepo.create).toHaveBeenCalledWith({
                design: { id: 1 },
                version: 2,
                dataSnapshot: { color: 'blue', size: 'L' },
                createdAt: new Date('2023-01-02T00:00:00.000Z'),
                order: { id: 2 },
            });
            expect(mockRepo.save).toHaveBeenCalledWith(createdEntity);
        });

        it('should create with default version when not provided', async () => {
            const dtoWithoutVersion: CreateDesignHistoryDto = {
                designId: 1,
                dataSnapshot: { color: 'green' },
            };

            const createdEntity = {
                ...mockDesignHistory,
                version: 1,
                dataSnapshot: { color: 'green' },
                order: null,
            };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(dtoWithoutVersion);

            expect(result.version).toBe(1);
            expect(mockRepo.create).toHaveBeenCalledWith({
                design: { id: 1 },
                version: 1,
                dataSnapshot: { color: 'green' },
                createdAt: expect.any(Date),
                order: null,
            });
        });

        it('should create without order', async () => {
            const dtoWithoutOrder: CreateDesignHistoryDto = {
                designId: 1,
                dataSnapshot: { color: 'yellow' },
            };

            const createdEntity = {
                ...mockDesignHistory,
                dataSnapshot: { color: 'yellow' },
                order: null,
            };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(dtoWithoutOrder);

            expect(result.order).toBeNull();
        });

        it('should throw InternalServerErrorException on database error', async () => {
            mockRepo.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateDesignHistoryDto = {
            dataSnapshot: { color: 'purple', size: 'XL' },
            version: 3,
        };

        it('should update and return the design history', async () => {
            const existingDesignHistory = { ...mockDesignHistory };
            const updatedDesignHistory = {
                ...existingDesignHistory,
                dataSnapshot: { color: 'purple', size: 'XL' },
                version: 3,
            };

            mockRepo.findOne.mockResolvedValue(existingDesignHistory);
            mockRepo.save.mockResolvedValue(updatedDesignHistory as any);

            const result = await service.update(1, updateDto);

            expect(result).toEqual(updatedDesignHistory);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['design', 'order']
            });
            expect(mockRepo.save).toHaveBeenCalledWith(updatedDesignHistory);
        });

        it('should update only provided fields', async () => {
            const partialUpdateDto: UpdateDesignHistoryDto = {
                version: 4,
            };

            const existingDesignHistory = { ...mockDesignHistory };
            const updatedDesignHistory = {
                ...existingDesignHistory,
                version: 4,
            };

            mockRepo.findOne.mockResolvedValue(existingDesignHistory);
            mockRepo.save.mockResolvedValue(updatedDesignHistory as any);

            const result = await service.update(1, partialUpdateDto);

            expect(result.version).toBe(4);
            expect(result.dataSnapshot).toEqual(mockDesignHistory.dataSnapshot); // unchanged
        });

        it('should throw NotFoundException when updating non-existent design history', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete design history and return success message', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepo.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when design history not found', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        });
    });
});