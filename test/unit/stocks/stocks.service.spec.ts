import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { StocksService } from '../../../src/stocks/stocks.service';
import { Stock } from '../../../src/stocks/stock.entity';
import { StorageService } from '../../../src/storage/storage.service';
import { CreateStockDto } from '../../../src/stocks/dto/create-stock.dto';
import { UpdateStockDto } from '../../../src/stocks/dto/update-stock.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('StocksService', () => {
    let service: StocksService;
    let mockRepo: jest.Mocked<Repository<Stock>>;
    let mockStorageService: jest.Mocked<StorageService>;

    const mockStock: Stock = {
        id: 1,
        cloth: { id: 1 } as any,
        gender: 'unisex',
        color: 'red',
        size: 'M',
        stock: 10,
    };

    const mockStocks: Stock[] = [mockStock];

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
                StocksService,
                {
                    provide: StorageService,
                    useValue: mockStorageServiceValue,
                },
            ],
        }).compile();

        service = module.get<StocksService>(StocksService);
        mockRepo = mockRepository as any;
        mockStorageService = mockStorageServiceValue as any;

        // Initialize the service
        await service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all stocks with relations', async () => {
            mockRepo.find.mockResolvedValue(mockStocks);

            const result = await service.findAll();

            expect(result).toEqual(mockStocks);
            expect(mockRepo.find).toHaveBeenCalledWith({ relations: ['cloth'] });
        });

        it('should return empty array when no stocks exist', async () => {
            mockRepo.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a stock when found', async () => {
            mockRepo.findOne.mockResolvedValue(mockStock);

            const result = await service.findOne(1);

            expect(result).toEqual(mockStock);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['cloth']
            });
        });

        it('should throw NotFoundException when stock not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        const createDto: CreateStockDto = {
            cloth: 1,
            gender: 'unisex',
            color: 'red',
            size: 'M',
            stock: 10,
        };

        it('should create and return a stock', async () => {
            const createdEntity = { ...mockStock };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(createDto);

            expect(result).toEqual(createdEntity);
            expect(mockRepo.create).toHaveBeenCalledWith({
                cloth: { id: 1 },
                gender: 'unisex',
                color: 'red',
                size: 'M',
                stock: 10,
            });
            expect(mockRepo.save).toHaveBeenCalledWith(createdEntity);
        });

        it('should throw InternalServerErrorException on database error', async () => {
            mockRepo.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateStockDto = {
            gender: 'male',
            color: 'blue',
            size: 'L',
            stock: 20,
            cloth: 2,
        };

        it('should update and return the stock', async () => {
            const existingStock = { ...mockStock };
            const updatedStock = {
                ...existingStock,
                gender: 'male',
                color: 'blue',
                size: 'L',
                stock: 20,
                cloth: { id: 2 },
            };

            mockRepo.findOne.mockResolvedValue(existingStock);
            mockRepo.save.mockResolvedValue(updatedStock as any);

            const result = await service.update(1, updateDto);

            expect(result).toEqual(updatedStock);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['cloth']
            });
            expect(mockRepo.save).toHaveBeenCalledWith(updatedStock);
        });

        it('should update only provided fields', async () => {
            const partialUpdateDto: UpdateStockDto = {
                stock: 15,
            };

            const existingStock = { ...mockStock };
            const updatedStock = {
                ...existingStock,
                stock: 15,
            };

            mockRepo.findOne.mockResolvedValue(existingStock);
            mockRepo.save.mockResolvedValue(updatedStock as any);

            const result = await service.update(1, partialUpdateDto);

            expect(result.stock).toBe(15);
            expect(result.color).toBe(mockStock.color); // unchanged
        });

        it('should handle zero stock', async () => {
            const updateDtoWithZero: UpdateStockDto = {
                stock: 0,
            };

            const existingStock = { ...mockStock };
            const updatedStock = {
                ...existingStock,
                stock: 0,
            };

            mockRepo.findOne.mockResolvedValue(existingStock);
            mockRepo.save.mockResolvedValue(updatedStock as any);

            const result = await service.update(1, updateDtoWithZero);

            expect(result.stock).toBe(0);
        });

        it('should throw NotFoundException when updating non-existent stock', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete stock and return success message', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepo.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when stock not found', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        });
    });
});