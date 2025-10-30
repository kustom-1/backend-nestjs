import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CartsService } from '../../../src/carts/carts.service';
import { StorageService } from '../../../src/storage/storage.service';
import { Cart } from '../../../src/carts/cart.entity';
import { mockRepository } from '../setup';

describe('CartsService', () => {
    let service: CartsService;
    let storageService: jest.Mocked<StorageService>;

    const mockCart: Cart = {
        id: 1,
        user: { id: 1 } as any,
    };

    beforeEach(async () => {
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartsService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<CartsService>(CartsService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all carts with relations', async () => {
            const carts = [mockCart];
            mockRepository.find.mockResolvedValue(carts);

            const result = await service.findAll();

            expect(result).toEqual(carts);
            expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['user'] });
        });
    });

    describe('findOne', () => {
        it('should return a cart by id with relations', async () => {
            mockRepository.findOne.mockResolvedValue(mockCart);

            const result = await service.findOne(1);

            expect(result).toEqual(mockCart);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user']
            });
        });

        it('should throw NotFoundException if cart not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Cart 999 not found');
        });
    });

    describe('create', () => {
        it('should create a new cart with user', async () => {
            const createData = { user: 1 };
            const createdCart = { ...mockCart };

            mockRepository.create.mockReturnValue(createdCart);
            mockRepository.save.mockResolvedValue(createdCart);

            const result = await service.create(createData);

            expect(result).toEqual(createdCart);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
            });
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should create a new cart without user', async () => {
            const createData = {};
            const createdCart = { ...mockCart, user: null };

            mockRepository.create.mockReturnValue(createdCart);
            mockRepository.save.mockResolvedValue(createdCart);

            const result = await service.create(createData);

            expect(result).toEqual(createdCart);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: null,
            });
        });

        it('should throw InternalServerErrorException on save error', async () => {
            const createData = { user: 1 };
            mockRepository.create.mockReturnValue(mockCart);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createData)).rejects.toThrow(InternalServerErrorException);
            await expect(service.create(createData)).rejects.toThrow('Error creating cart');
        });
    });

    describe('update', () => {
        it('should update a cart with user', async () => {
            const updateData = { user: 2 };
            const updatedCart = { ...mockCart, user: { id: 2 } as any };

            mockRepository.findOne.mockResolvedValue(mockCart);
            mockRepository.save.mockResolvedValue(updatedCart);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedCart);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedCart);
        });

        it('should update a cart without user change', async () => {
            const updateData = {};
            const updatedCart = { ...mockCart };

            mockRepository.findOne.mockResolvedValue(mockCart);
            mockRepository.save.mockResolvedValue(updatedCart);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedCart);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedCart);
        });

        it('should throw NotFoundException if cart not found for update', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, { user: 1 })).rejects.toThrow(NotFoundException);
            await expect(service.update(999, { user: 1 })).rejects.toThrow('Cart 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete a cart', async () => {
            mockRepository.findOne.mockResolvedValue(mockCart);
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if cart not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Cart 999 not found');
        });
    });
});