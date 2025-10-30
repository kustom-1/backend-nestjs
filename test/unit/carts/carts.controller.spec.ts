import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from '../../../src/carts/carts.controller';
import { CartsService } from '../../../src/carts/carts.service';
import { Cart } from '../../../src/carts/cart.entity';
import { CreateCartDto } from '../../../src/carts/dto/create-cart.dto';
import { UpdateCartDto } from '../../../src/carts/dto/update-cart.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('CartsController', () => {
    let controller: CartsController;
    let service: jest.Mocked<CartsService>;

    const mockCart: Cart = {
        id: 1,
        user: { id: 1 } as any,
    };

    const mockCarts: Cart[] = [mockCart];

    const mockCreateCartDto: CreateCartDto = {
        user: 1,
    };

    const mockUpdateCartDto: UpdateCartDto = {
        user: 2,
    };

    beforeEach(async () => {
        const mockCartsService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CartsController],
            providers: [
                {
                    provide: CartsService,
                    useValue: mockCartsService,
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

        controller = module.get<CartsController>(CartsController);
        service = module.get(CartsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all carts', async () => {
            service.findAll.mockResolvedValue(mockCarts);

            const result = await controller.findAll();

            expect(result).toEqual(mockCarts);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a cart by id', async () => {
            service.findOne.mockResolvedValue(mockCart);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockCart);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Cart not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('Cart not found');
        });
    });

    describe('create', () => {
        it('should create a new cart', async () => {
            service.create.mockResolvedValue(mockCart);

            const result = await controller.create(mockCreateCartDto);

            expect(result).toEqual(mockCart);
            expect(service.create).toHaveBeenCalledWith(mockCreateCartDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Error creating cart');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateCartDto)).rejects.toThrow('Error creating cart');
        });
    });

    describe('update', () => {
        it('should update a cart', async () => {
            const updatedCart = { ...mockCart, user: { id: 2 } as any };
            service.update.mockResolvedValue(updatedCart);

            const result = await controller.update(1, mockUpdateCartDto);

            expect(result).toEqual(updatedCart);
            expect(service.update).toHaveBeenCalledWith(1, mockUpdateCartDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Cart not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, mockUpdateCartDto)).rejects.toThrow('Cart not found');
        });
    });

    describe('delete', () => {
        it('should delete a cart', async () => {
            const deleteResult = { message: 'Deleted' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Cart not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('Cart not found');
        });
    });
});