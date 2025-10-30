import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CategoriesService } from '../../../src/categories/categories.service';
import { StorageService } from '../../../src/storage/storage.service';
import { Category } from '../../../src/categories/category.entity';
import { mockRepository } from '../setup';

describe('CategoriesService', () => {
    let service: CategoriesService;
    let storageService: jest.Mocked<StorageService>;

    const mockCategory: Category = {
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
    };

    beforeEach(async () => {
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoriesService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<CategoriesService>(CategoriesService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all categories', async () => {
            const categories = [mockCategory];
            mockRepository.find.mockResolvedValue(categories);

            const result = await service.findAll();

            expect(result).toEqual(categories);
            expect(mockRepository.find).toHaveBeenCalledWith();
        });
    });

    describe('findOne', () => {
        it('should return a category by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockCategory);

            const result = await service.findOne(1);

            expect(result).toEqual(mockCategory);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('should throw NotFoundException if category not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Category 999 not found');
        });
    });

    describe('create', () => {
        it('should create a new category', async () => {
            const createData = {
                name: 'New Category',
                description: 'New Description',
            };
            const createdCategory = { ...mockCategory, ...createData };

            mockRepository.create.mockReturnValue(createdCategory);
            mockRepository.save.mockResolvedValue(createdCategory);

            const result = await service.create(createData);

            expect(result).toEqual(createdCategory);
            expect(mockRepository.create).toHaveBeenCalledWith(createData as Partial<Category>);
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException on save error', async () => {
            const createData = {
                name: 'New Category',
                description: 'New Description',
            };
            mockRepository.create.mockReturnValue(mockCategory);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createData)).rejects.toThrow(InternalServerErrorException);
            await expect(service.create(createData)).rejects.toThrow('Error creating category');
        });
    });

    describe('update', () => {
        it('should update a category with all fields', async () => {
            const updateData = {
                name: 'Updated Category',
                description: 'Updated Description',
            };
            const updatedCategory = { ...mockCategory, ...updateData };

            mockRepository.findOne.mockResolvedValue(mockCategory);
            mockRepository.save.mockResolvedValue(updatedCategory);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedCategory);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedCategory);
        });

        it('should update a category with partial fields', async () => {
            const updateData = { name: 'Updated Name' };
            const updatedCategory = { ...mockCategory, name: 'Updated Name' };

            mockRepository.findOne.mockResolvedValue(mockCategory);
            mockRepository.save.mockResolvedValue(updatedCategory);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedCategory);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedCategory);
        });

        it('should throw NotFoundException if category not found for update', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(NotFoundException);
            await expect(service.update(999, { name: 'New Name' })).rejects.toThrow('Category 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete a category', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if category not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Category 999 not found');
        });
    });
});