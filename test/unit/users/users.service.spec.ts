import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../../../src/users/users.service';
import { PasswordService } from '../../../src/common/password.service';
import { StorageService } from '../../../src/storage/storage.service';
import { User } from '../../../src/users/users.entity';
import { mockRepository } from '../setup';

describe('UsersService', () => {
    let service: UsersService;
    let passwordService: jest.Mocked<PasswordService>;
    let storageService: jest.Mocked<StorageService>;

    const mockUser: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        isActive: true,
        role: 'Consultor' as any,
    };

    beforeEach(async () => {
        const mockPasswordService = {
            hashPassword: jest.fn(),
        };

        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PasswordService,
                    useValue: mockPasswordService,
                },
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        passwordService = module.get(PasswordService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findByEmail('john.doe@example.com');

            expect(result).toEqual(mockUser);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'john.doe@example.com' },
            });
        });

        it('should return null if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.findByEmail('notfound@example.com');

            expect(result).toBeNull();
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(1);

            expect(result).toEqual(mockUser);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const userData = {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                password: 'password123',
            };

            mockRepository.findOne.mockResolvedValue(null);
            passwordService.hashPassword.mockResolvedValue('hashedPassword123');
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);

            const result = await service.create(userData);

            expect(result).toEqual(mockUser);
            expect(passwordService.hashPassword).toHaveBeenCalledWith('password123');
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if email already exists', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.create({ email: 'john.doe@example.com' })).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw InternalServerErrorException on save error', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            passwordService.hashPassword.mockResolvedValue('hashedPassword');
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [mockUser];
            mockRepository.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(result).toEqual(users);
            expect(mockRepository.find).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateData = { firstName: 'Updated Name' };
            const updatedUser = { ...mockUser, ...updateData };

            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue(updatedUser);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedUser);
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException on update error', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.update(1, { firstName: 'Test' })).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('delete', () => {
        it('should delete a user', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'User deleted successfully' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if user not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        });
    });
});