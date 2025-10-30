import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AddressesService } from '../../../src/addresses/addresses.service';
import { StorageService } from '../../../src/storage/storage.service';
import { Address } from '../../../src/addresses/address.entity';
import { mockRepository } from '../setup';

describe('AddressesService', () => {
    let service: AddressesService;
    let storageService: jest.Mocked<StorageService>;

    const mockAddress: Address = {
        id: 1,
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        user: { id: 1 } as any,
    };

    beforeEach(async () => {
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddressesService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<AddressesService>(AddressesService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all addresses with relations', async () => {
            const addresses = [mockAddress];
            mockRepository.find.mockResolvedValue(addresses);

            const result = await service.findAll();

            expect(result).toEqual(addresses);
            expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['user'] });
        });
    });

    describe('findOne', () => {
        it('should return an address by id with relations', async () => {
            mockRepository.findOne.mockResolvedValue(mockAddress);

            const result = await service.findOne(1);

            expect(result).toEqual(mockAddress);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user']
            });
        });

        it('should throw NotFoundException if address not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Address 999 not found');
        });
    });

    describe('create', () => {
        it('should create a new address with user', async () => {
            const createData = {
                street: '123 Main St',
                city: 'Test City',
                state: 'Test State',
                postalCode: '12345',
                country: 'Test Country',
                user: 1
            };
            const createdAddress = { ...mockAddress };

            mockRepository.create.mockReturnValue(createdAddress);
            mockRepository.save.mockResolvedValue(createdAddress);

            const result = await service.create(createData);

            expect(result).toEqual(createdAddress);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
            });
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException on save error', async () => {
            const createData = {
                street: '123 Main St',
                city: 'Test City',
                state: 'Test State',
                postalCode: '12345',
                country: 'Test Country',
                user: 1
            };
            mockRepository.create.mockReturnValue(mockAddress);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createData)).rejects.toThrow(InternalServerErrorException);
            await expect(service.create(createData)).rejects.toThrow('Error creating address');
        });
    });

    describe('update', () => {
        it('should update an address with all fields', async () => {
            const updateData = {
                street: '456 New St',
                city: 'New City',
                state: 'New State',
                postalCode: '67890',
                country: 'New Country',
                user: 2
            };
            const updatedAddress = {
                ...mockAddress,
                ...updateData,
                user: { id: 2 } as any
            };

            mockRepository.findOne.mockResolvedValue(mockAddress);
            mockRepository.save.mockResolvedValue(updatedAddress);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedAddress);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedAddress);
        });

        it('should update an address with partial fields', async () => {
            const updateData = { street: '456 New St' };
            const updatedAddress = { ...mockAddress, street: '456 New St' };

            mockRepository.findOne.mockResolvedValue(mockAddress);
            mockRepository.save.mockResolvedValue(updatedAddress);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedAddress);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedAddress);
        });

        it('should throw NotFoundException if address not found for update', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, { street: 'New St' })).rejects.toThrow(NotFoundException);
            await expect(service.update(999, { street: 'New St' })).rejects.toThrow('Address 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete an address', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if address not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Address 999 not found');
        });
    });
});