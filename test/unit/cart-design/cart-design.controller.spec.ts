import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { CartDesignController } from '../../../src/cart-design/cart-design.controller';
import { CartDesignService } from '../../../src/cart-design/cart-design.service';
import { CreateCartDesignDto } from '../../../src/cart-design/dto/create-cart-design.dto';
import { UpdateCartDesignDto } from '../../../src/cart-design/dto/update-cart-design.dto';
import { CartDesign } from '../../../src/cart-design/cart-design.entity';
import { AbacGuard } from '../../../src/permissions/guards/abac.guard';

describe('CartDesignController', () => {
    let controller: CartDesignController;
    let service: jest.Mocked<CartDesignService>;

    const mockCartDesign: CartDesign = {
        id: 1,
        design: { id: 1 } as any,
        cart: { id: 1 } as any,
        quantity: 2,
        subtotal: 50.00,
    };

    const mockCartDesigns: CartDesign[] = [mockCartDesign];

    beforeEach(async () => {
        const mockService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
          controllers: [CartDesignController],
          providers: [
            {
              provide: CartDesignService,
              useValue: mockService,
            },
            {
              provide: 'PermissionsService',
              useValue: {},
            },
          ],
        })
        .overrideGuard(AuthGuard('jwt'))
        .useValue({ canActivate: () => true })
        .overrideGuard(AbacGuard)
        .useValue({ canActivate: () => true })
        .compile();

        controller = module.get<CartDesignController>(CartDesignController);
        service = module.get(CartDesignService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all cart designs', async () => {
            service.findAll.mockResolvedValue(mockCartDesigns);

            const result = await controller.findAll();

            expect(result).toEqual(mockCartDesigns);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no cart designs exist', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a cart design by id', async () => {
            service.findOne.mockResolvedValue(mockCartDesign);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockCartDesign);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('create', () => {
        const createDto: CreateCartDesignDto = {
            design: 1,
            cart: 1,
            quantity: 3,
            subtotal: 75.00,
        };

        it('should create and return a cart design', async () => {
            service.create.mockResolvedValue(mockCartDesign);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockCartDesign);
            expect(service.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('update', () => {
        const updateDto: UpdateCartDesignDto = {
            quantity: 5,
            subtotal: 125.00,
        };

        it('should update and return the cart design', async () => {
            const updatedCartDesign = { ...mockCartDesign, quantity: 5 };
            service.update.mockResolvedValue(updatedCartDesign);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(updatedCartDesign);
            expect(service.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('delete', () => {
        it('should delete a cart design and return success message', async () => {
            service.delete.mockResolvedValue({ message: 'Deleted' });

            const result = await controller.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });
});