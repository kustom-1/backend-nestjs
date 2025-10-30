import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from '../../../src/addresses/addresses.controller';
import { AddressesService } from '../../../src/addresses/addresses.service';
import { Address } from '../../../src/addresses/address.entity';
import { CreateAddressDto } from '../../../src/addresses/dto/create-address.dto';
import { UpdateAddressDto } from '../../../src/addresses/dto/update-address.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('AddressesController', () => {
    let controller: AddressesController;
    let service: jest.Mocked<AddressesService>;

    const mockAddress: Address = {
        id: 1,
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        user: { id: 1 } as any,
    };

    const mockAddresses: Address[] = [mockAddress];

    const mockCreateAddressDto: CreateAddressDto = {
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        user: 1,
    };

    const mockUpdateAddressDto: UpdateAddressDto = {
        street: '456 New St',
        city: 'New City',
        state: 'New State',
        postalCode: '67890',
        country: 'New Country',
        user: 2,
    };

    beforeEach(async () => {
        const mockAddressesService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AddressesController],
            providers: [
                {
                    provide: AddressesService,
                    useValue: mockAddressesService,
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

        controller = module.get<AddressesController>(AddressesController);
        service = module.get(AddressesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all addresses', async () => {
            service.findAll.mockResolvedValue(mockAddresses);

            const result = await controller.findAll();

            expect(result).toEqual(mockAddresses);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return an address by id', async () => {
            service.findOne.mockResolvedValue(mockAddress);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockAddress);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Address not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('Address not found');
        });
    });

    describe('create', () => {
        it('should create a new address', async () => {
            service.create.mockResolvedValue(mockAddress);

            const result = await controller.create(mockCreateAddressDto);

            expect(result).toEqual(mockAddress);
            expect(service.create).toHaveBeenCalledWith(mockCreateAddressDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Error creating address');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateAddressDto)).rejects.toThrow('Error creating address');
        });
    });

    describe('update', () => {
        it('should update an address', async () => {
            const updatedAddress = {
                ...mockAddress,
                street: '456 New St',
                city: 'New City',
                state: 'New State',
                postalCode: '67890',
                country: 'New Country',
                user: { id: 2 } as any
            };
            service.update.mockResolvedValue(updatedAddress);

            const result = await controller.update(1, mockUpdateAddressDto);

            expect(result).toEqual(updatedAddress);
            expect(service.update).toHaveBeenCalledWith(1, mockUpdateAddressDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Address not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, mockUpdateAddressDto)).rejects.toThrow('Address not found');
        });
    });

    describe('delete', () => {
        it('should delete an address', async () => {
            const deleteResult = { message: 'Deleted' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Address not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('Address not found');
        });
    });
});