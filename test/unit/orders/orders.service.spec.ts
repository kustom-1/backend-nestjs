import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OrdersService } from '../../../src/orders/orders.service';
import { StorageService } from '../../../src/storage/storage.service';
import { Order } from '../../../src/orders/order.entity';
import { mockRepository } from '../setup';

describe('OrdersService', () => {
    let service: OrdersService;
    let storageService: jest.Mocked<StorageService>;

    const mockOrder: Order = {
        id: 1,
        quantity: 1,
        user: { id: 1 } as any,
        date: new Date(),
        status: 'pending',
        address: { id: 1 } as any,
    };

    beforeEach(async () => {
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all orders with relations', async () => {
            const orders = [mockOrder];
            mockRepository.find.mockResolvedValue(orders);

            const result = await service.findAll();

            expect(result).toEqual(orders);
            expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['user', 'address'] });
        });
    });

    describe('findOne', () => {
        it('should return an order by id with relations', async () => {
            mockRepository.findOne.mockResolvedValue(mockOrder);

            const result = await service.findOne(1);

            expect(result).toEqual(mockOrder);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'address']
            });
        });

        it('should throw NotFoundException if order not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Order 999 not found');
        });
    });

    describe('create', () => {
        it('should create a new order with all fields', async () => {
            const createData = {
                user: 1,
                quantity: 2,
                date: '2023-01-01T00:00:00.000Z',
                status: 'completed',
                address: 1
            };
            const createdOrder = {
                ...mockOrder,
                quantity: 2,
                date: new Date(createData.date),
                status: 'completed'
            };

            mockRepository.create.mockReturnValue(createdOrder);
            mockRepository.save.mockResolvedValue(createdOrder);

            const result = await service.create(createData);

            expect(result).toEqual(createdOrder);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
                address: { id: createData.address },
                date: new Date(createData.date),
            });
        });

        it('should create a new order with minimal required fields', async () => {
            const createData = { user: 1 };
            const createdOrder = {
                ...mockOrder,
                quantity: 1,
                date: new Date(),
                status: undefined,
                address: null
            };

            mockRepository.create.mockReturnValue(createdOrder);
            mockRepository.save.mockResolvedValue(createdOrder);

            const result = await service.create(createData);

            expect(result).toEqual(createdOrder);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
                address: null,
                date: expect.any(Date),
            });
        });

        it('should create a new order without optional fields', async () => {
            const createData = { user: 1 };
            const createdOrder = { ...mockOrder, address: null };

            mockRepository.create.mockReturnValue(createdOrder);
            mockRepository.save.mockResolvedValue(createdOrder);

            const result = await service.create(createData);

            expect(result).toEqual(createdOrder);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
                address: null,
                date: expect.any(Date),
            });
        });

        it('should throw InternalServerErrorException on save error', async () => {
            const createData = { user: 1 };
            mockRepository.create.mockReturnValue(mockOrder);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createData)).rejects.toThrow(InternalServerErrorException);
            await expect(service.create(createData)).rejects.toThrow('Error creating order');
        });
    });

    describe('update', () => {
        it('should update an order with all fields', async () => {
            const updateData = {
                user: 2,
                address: 2,
                quantity: 3,
                status: 'shipped',
                date: '2023-01-02T00:00:00.000Z'
            };
            const updatedOrder = {
                ...mockOrder,
                user: { id: 2 } as any,
                address: { id: 2 } as any,
                quantity: 3,
                status: 'shipped',
                date: new Date(updateData.date)
            };

            mockRepository.findOne.mockResolvedValue(mockOrder);
            mockRepository.save.mockResolvedValue(updatedOrder);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedOrder);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedOrder);
        });

        it('should update an order with partial fields', async () => {
            const updateData = { quantity: 5 };
            const updatedOrder = { ...mockOrder, quantity: 5 };

            mockRepository.findOne.mockResolvedValue(mockOrder);
            mockRepository.save.mockResolvedValue(updatedOrder);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedOrder);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedOrder);
        });

        it('should update an order without changing fields', async () => {
            const updateData = {};
            const updatedOrder = { ...mockOrder };

            mockRepository.findOne.mockResolvedValue(mockOrder);
            mockRepository.save.mockResolvedValue(updatedOrder);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedOrder);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedOrder);
        });

        it('should throw NotFoundException if order not found for update', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, { quantity: 2 })).rejects.toThrow(NotFoundException);
            await expect(service.update(999, { quantity: 2 })).rejects.toThrow('Order 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete an order', async () => {
            mockRepository.findOne.mockResolvedValue(mockOrder);
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if order not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Order 999 not found');
        });
    });
});