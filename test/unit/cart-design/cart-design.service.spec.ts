import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CartDesignService } from '../../../src/cart-design/cart-design.service';
import { CartDesign } from '../../../src/cart-design/cart-design.entity';
import { StorageService } from '../../../src/storage/storage.service';
import { CreateCartDesignDto } from '../../../src/cart-design/dto/create-cart-design.dto';
import { UpdateCartDesignDto } from '../../../src/cart-design/dto/update-cart-design.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('CartDesignService', () => {
    let service: CartDesignService;
    let mockRepo: jest.Mocked<Repository<CartDesign>>;
    let mockStorageService: jest.Mocked<StorageService>;

    const mockCartDesign: CartDesign = {
        id: 1,
        design: { id: 1 } as any,
        cart: { id: 1 } as any,
        quantity: 2,
        subtotal: 50.00,
    };

    const mockCartDesigns: CartDesign[] = [mockCartDesign];

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
                CartDesignService,
                {
                    provide: StorageService,
                    useValue: mockStorageServiceValue,
                },
            ],
        }).compile();

        service = module.get<CartDesignService>(CartDesignService);
        mockRepo = mockRepository as any;
        mockStorageService = mockStorageServiceValue as any;

        // Initialize the service
        await service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all cart designs with relations', async () => {
            mockRepo.find.mockResolvedValue(mockCartDesigns);

            const result = await service.findAll();

            expect(result).toEqual(mockCartDesigns);
            expect(mockRepo.find).toHaveBeenCalledWith({ relations: ['design', 'cart'] });
        });

        it('should return empty array when no cart designs exist', async () => {
            mockRepo.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a cart design when found', async () => {
            mockRepo.findOne.mockResolvedValue(mockCartDesign);

            const result = await service.findOne(1);

            expect(result).toEqual(mockCartDesign);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['design', 'cart']
            });
        });

        it('should throw NotFoundException when cart design not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
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
            const createdEntity = { ...mockCartDesign, quantity: 3, subtotal: 75.00 };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(createDto);

            expect(result).toEqual(createdEntity);
            expect(mockRepo.create).toHaveBeenCalledWith({
                design: { id: 1 },
                cart: { id: 1 },
                quantity: 3,
                subtotal: 75.00,
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
        const updateDto: UpdateCartDesignDto = {
            quantity: 5,
            subtotal: 125.00,
        };

        it('should update and return the cart design', async () => {
            const existingCartDesign = { ...mockCartDesign };
            const updatedCartDesign = {
                ...existingCartDesign,
                quantity: 5,
                subtotal: 125.00,
            };

            mockRepo.findOne.mockResolvedValue(existingCartDesign);
            mockRepo.save.mockResolvedValue(updatedCartDesign as any);

            const result = await service.update(1, updateDto);

            expect(result).toEqual(updatedCartDesign);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['design', 'cart']
            });
            expect(mockRepo.save).toHaveBeenCalledWith(updatedCartDesign);
        });

        it('should update only provided fields', async () => {
            const partialUpdateDto: UpdateCartDesignDto = {
                quantity: 4,
            };

            const existingCartDesign = { ...mockCartDesign };
            const updatedCartDesign = {
                ...existingCartDesign,
                quantity: 4,
            };

            mockRepo.findOne.mockResolvedValue(existingCartDesign);
            mockRepo.save.mockResolvedValue(updatedCartDesign as any);

            const result = await service.update(1, partialUpdateDto);

            expect(result.quantity).toBe(4);
            expect(result.subtotal).toBe(mockCartDesign.subtotal); // unchanged
        });

        it('should handle zero subtotal', async () => {
            const updateDtoWithZero: UpdateCartDesignDto = {
                subtotal: 0,
            };

            const existingCartDesign = { ...mockCartDesign };
            const updatedCartDesign = {
                ...existingCartDesign,
                subtotal: 0,
            };

            mockRepo.findOne.mockResolvedValue(existingCartDesign);
            mockRepo.save.mockResolvedValue(updatedCartDesign as any);

            const result = await service.update(1, updateDtoWithZero);

            expect(result.subtotal).toBe(0);
        });

        it('should throw NotFoundException when updating non-existent cart design', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete cart design and return success message', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepo.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when cart design not found', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        });
    });
});