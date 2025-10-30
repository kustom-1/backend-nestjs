import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../../src/orders/orders.controller';
import { OrdersService } from '../../../src/orders/orders.service';
import { Order } from '../../../src/orders/order.entity';
import { CreateOrderDto } from '../../../src/orders/dto/create-order.dto';
import { UpdateOrderDto } from '../../../src/orders/dto/update-order.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('OrdersController', () => {
    let controller: OrdersController;
    let service: jest.Mocked<OrdersService>;

    const mockOrder: Order = {
        id: 1,
        quantity: 1,
        user: { id: 1 } as any,
        date: new Date(),
        status: 'pending',
        address: { id: 1 } as any,
    };

    const mockOrders: Order[] = [mockOrder];

    const mockCreateOrderDto: CreateOrderDto = {
        user: 1,
        quantity: 2,
        date: '2023-01-01T00:00:00.000Z',
        status: 'completed',
        address: 1,
    };

    const mockUpdateOrderDto: UpdateOrderDto = {
        quantity: 3,
        status: 'shipped',
        date: '2023-01-02T00:00:00.000Z',
        address: 2,
    };

    beforeEach(async () => {
        const mockOrdersService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [
                {
                    provide: OrdersService,
                    useValue: mockOrdersService,
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

        controller = module.get<OrdersController>(OrdersController);
        service = module.get(OrdersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all orders', async () => {
            service.findAll.mockResolvedValue(mockOrders);

            const result = await controller.findAll();

            expect(result).toEqual(mockOrders);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return an order by id', async () => {
            service.findOne.mockResolvedValue(mockOrder);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockOrder);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Order not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('Order not found');
        });
    });

    describe('create', () => {
        it('should create a new order', async () => {
            service.create.mockResolvedValue(mockOrder);

            const result = await controller.create(mockCreateOrderDto);

            expect(result).toEqual(mockOrder);
            expect(service.create).toHaveBeenCalledWith(mockCreateOrderDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Error creating order');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateOrderDto)).rejects.toThrow('Error creating order');
        });
    });

    describe('update', () => {
        it('should update an order', async () => {
            const updatedOrder = {
                ...mockOrder,
                quantity: 3,
                status: 'shipped',
                date: new Date('2023-01-02T00:00:00.000Z'),
                address: { id: 2 } as any
            };
            service.update.mockResolvedValue(updatedOrder);

            const result = await controller.update(1, mockUpdateOrderDto);

            expect(result).toEqual(updatedOrder);
            expect(service.update).toHaveBeenCalledWith(1, mockUpdateOrderDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Order not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, mockUpdateOrderDto)).rejects.toThrow('Order not found');
        });
    });

    describe('delete', () => {
        it('should delete an order', async () => {
            const deleteResult = { message: 'Deleted' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Order not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('Order not found');
        });
    });
});