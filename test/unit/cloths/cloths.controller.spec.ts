import { Test, TestingModule } from '@nestjs/testing';
import { ClothsController } from '../../../src/cloths/cloths.controller';
import { ClothsService } from '../../../src/cloths/cloths.service';
import { Cloth } from '../../../src/cloths/cloth.entity';
import { CreateClothDto } from '../../../src/cloths/dto/create-cloth.dto';
import { UpdateClothDto } from '../../../src/cloths/dto/update-cloth.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('ClothsController', () => {
    let controller: ClothsController;
    let service: jest.Mocked<ClothsService>;

    const mockCloth: Cloth = {
        id: 1,
        name: 'Test Cloth',
        description: 'Test Description',
        basePrice: 29.99,
        modelUrl: 'test-model-url',
        category: { id: 1 } as any,
    };

    const mockCloths: Cloth[] = [mockCloth];

    const mockCreateClothDto: CreateClothDto = {
        name: 'New Cloth',
        description: 'New Description',
        basePrice: 39.99,
        modelUrl: 'new-model-url',
        category: 2,
    };

    const mockUpdateClothDto: UpdateClothDto = {
        name: 'Updated Cloth',
        description: 'Updated Description',
        basePrice: 49.99,
        modelUrl: 'updated-model-url',
    };

    beforeEach(async () => {
        const mockClothsService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClothsController],
            providers: [
                {
                    provide: ClothsService,
                    useValue: mockClothsService,
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

        controller = module.get<ClothsController>(ClothsController);
        service = module.get(ClothsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all cloths', async () => {
            service.findAll.mockResolvedValue(mockCloths);

            const result = await controller.findAll();

            expect(result).toEqual(mockCloths);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a cloth by id', async () => {
            service.findOne.mockResolvedValue(mockCloth);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockCloth);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Cloth not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('Cloth not found');
        });
    });

    describe('create', () => {
        it('should create a new cloth', async () => {
            service.create.mockResolvedValue(mockCloth);

            const result = await controller.create(mockCreateClothDto);

            expect(result).toEqual(mockCloth);
            expect(service.create).toHaveBeenCalledWith(mockCreateClothDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Error creating cloth');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateClothDto)).rejects.toThrow('Error creating cloth');
        });
    });

    describe('update', () => {
        it('should update a cloth', async () => {
            const updatedCloth = {
                ...mockCloth,
                name: 'Updated Cloth',
                description: 'Updated Description',
                basePrice: 49.99,
                modelUrl: 'updated-model-url',
            };
            service.update.mockResolvedValue(updatedCloth);

            const result = await controller.update(1, mockUpdateClothDto);

            expect(result).toEqual(updatedCloth);
            expect(service.update).toHaveBeenCalledWith(1, mockUpdateClothDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Cloth not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, mockUpdateClothDto)).rejects.toThrow('Cloth not found');
        });
    });

    describe('delete', () => {
        it('should delete a cloth', async () => {
            const deleteResult = { message: 'Deleted' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Cloth not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('Cloth not found');
        });
    });
});