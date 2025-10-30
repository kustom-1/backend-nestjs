import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ClothsService } from '../../../src/cloths/cloths.service';
import { StorageService } from '../../../src/storage/storage.service';
import { Cloth } from '../../../src/cloths/cloth.entity';
import { mockRepository } from '../setup';

describe('ClothsService', () => {
    let service: ClothsService;
    let storageService: jest.Mocked<StorageService>;

    const mockCloth: Cloth = {
        id: 1,
        name: 'Test Cloth',
        description: 'Test Description',
        basePrice: 29.99,
        stock: 10,
        modelUrl: 'test-model-url',
        category: { id: 1 } as any,
    };

    beforeEach(async () => {
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClothsService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<ClothsService>(ClothsService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all cloths', async () => {
            const cloths = [mockCloth];
            mockRepository.find.mockResolvedValue(cloths);

            const result = await service.findAll();

            expect(result).toEqual(cloths);
            expect(mockRepository.find).toHaveBeenCalledWith();
        });
    });

    describe('findOne', () => {
        it('should return a cloth by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockCloth);

            const result = await service.findOne(1);

            expect(result).toEqual(mockCloth);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('should throw NotFoundException if cloth not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Cloth 999 not found');
        });
    });

    describe('create', () => {
        it('should create a new cloth with category', async () => {
            const createData = {
                name: 'New Cloth',
                description: 'New Description',
                price: 39.99,
                category: 1,
            };
            const createdCloth = { ...mockCloth, ...createData };

            mockRepository.create.mockReturnValue(createdCloth);
            mockRepository.save.mockResolvedValue(createdCloth);

            const result = await service.create(createData);

            expect(result).toEqual(createdCloth);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                category: { id: createData.category },
            });
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should create a new cloth with all fields', async () => {
            const createData = {
                name: 'New Cloth',
                description: 'New Description',
                basePrice: 39.99,
                stock: 5,
                modelUrl: 'new-model-url',
                category: 2,
            };
            const createdCloth = { ...mockCloth, ...createData };

            mockRepository.create.mockReturnValue(createdCloth);
            mockRepository.save.mockResolvedValue(createdCloth);

            const result = await service.create(createData);

            expect(result).toEqual(createdCloth);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                category: { id: createData.category },
            });
        });

        it('should throw InternalServerErrorException on save error', async () => {
            const createData = {
                name: 'New Cloth',
                description: 'New Description',
                basePrice: 39.99,
                stock: 5,
                modelUrl: 'new-model-url',
                category: 1,
            };
            mockRepository.create.mockReturnValue(mockCloth);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createData)).rejects.toThrow(InternalServerErrorException);
            await expect(service.create(createData)).rejects.toThrow('Error creating cloth');
        });
    });

    describe('update', () => {
        it('should update a cloth with all fields', async () => {
            const updateData = {
                name: 'Updated Cloth',
                description: 'Updated Description',
                price: 49.99,
            };
            const updatedCloth = { ...mockCloth, ...updateData };

            mockRepository.findOne.mockResolvedValue(mockCloth);
            mockRepository.save.mockResolvedValue(updatedCloth);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedCloth);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedCloth);
        });

        it('should update a cloth with partial fields', async () => {
            const updateData = { name: 'Updated Name' };
            const updatedCloth = { ...mockCloth, name: 'Updated Name' };

            mockRepository.findOne.mockResolvedValue(mockCloth);
            mockRepository.save.mockResolvedValue(updatedCloth);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedCloth);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedCloth);
        });

        it('should throw NotFoundException if cloth not found for update', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(NotFoundException);
            await expect(service.update(999, { name: 'New Name' })).rejects.toThrow('Cloth 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete a cloth', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if cloth not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Cloth 999 not found');
        });
    });
});