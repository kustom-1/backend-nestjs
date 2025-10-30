import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../../../src/categories/categories.controller';
import { CategoriesService } from '../../../src/categories/categories.service';
import { Category } from '../../../src/categories/category.entity';
import { CreateCategoryDto } from '../../../src/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../../../src/categories/dto/update-category.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('CategoriesController', () => {
    let controller: CategoriesController;
    let service: jest.Mocked<CategoriesService>;

    const mockCategory: Category = {
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
    };

    const mockCategories: Category[] = [mockCategory];

    const mockCreateCategoryDto: CreateCategoryDto = {
        name: 'New Category',
        description: 'New Description',
    };

    const mockUpdateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
        description: 'Updated Description',
    };

    beforeEach(async () => {
        const mockCategoriesService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [
                {
                    provide: CategoriesService,
                    useValue: mockCategoriesService,
                },
                {
                    provide: PermissionsService,
                    useValue: {},
                },
                {
                    provide: 'Reflector',
                    useValue: {},
                },
            ],
        })
            .overrideGuard('AbacGuard')
            .useValue({ canActivate: () => true })
            .overrideGuard('AuthGuard')
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CategoriesController>(CategoriesController);
        service = module.get(CategoriesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all categories', async () => {
            service.findAll.mockResolvedValue(mockCategories);

            const result = await controller.findAll();

            expect(result).toEqual(mockCategories);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a category by id', async () => {
            service.findOne.mockResolvedValue(mockCategory);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockCategory);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Category not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('Category not found');
        });
    });

    describe('create', () => {
        it('should create a new category', async () => {
            service.create.mockResolvedValue(mockCategory);

            const result = await controller.create(mockCreateCategoryDto);

            expect(result).toEqual(mockCategory);
            expect(service.create).toHaveBeenCalledWith(mockCreateCategoryDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Error creating category');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateCategoryDto)).rejects.toThrow('Error creating category');
        });
    });

    describe('update', () => {
        it('should update a category', async () => {
            const updatedCategory = { ...mockCategory, ...mockUpdateCategoryDto };
            service.update.mockResolvedValue(updatedCategory);

            const result = await controller.update(1, mockUpdateCategoryDto);

            expect(result).toEqual(updatedCategory);
            expect(service.update).toHaveBeenCalledWith(1, mockUpdateCategoryDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Category not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, mockUpdateCategoryDto)).rejects.toThrow('Category not found');
        });
    });

    describe('delete', () => {
        it('should delete a category', async () => {
            const deleteResult = { message: 'Deleted' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Category not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('Category not found');
        });
    });
});