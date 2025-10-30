import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/users.entity';
import { CreateUserDto } from '../../../src/users/dto/users-create.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;

    const mockUser: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        isActive: true,
        role: 'Consultor' as any,
    };

    const mockUsers: User[] = [mockUser];

    const mockCreateUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'Consultor' as any,
    };

    beforeEach(async () => {
      const mockUsersService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };
  
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UsersController],
        providers: [
          {
            provide: UsersService,
            useValue: mockUsersService,
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
  
      controller = module.get<UsersController>(UsersController);
      service = module.get(UsersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            service.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll();

            expect(result).toEqual(mockUsers);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            service.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockUser);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('User not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('User not found');
        });
    });

    describe('create', () => {
        it('should create a new user', async () => {
            service.create.mockResolvedValue(mockUser);

            const result = await controller.create(mockCreateUserDto);

            expect(result).toEqual(mockUser);
            expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Email already exists');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateUserDto)).rejects.toThrow('Email already exists');
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateData = { firstName: 'Updated Name' };
            const updatedUser = { ...mockUser, ...updateData };

            service.update.mockResolvedValue(updatedUser);

            const result = await controller.update(1, updateData);

            expect(result).toEqual(updatedUser);
            expect(service.update).toHaveBeenCalledWith(1, updateData);
        });

        it('should pass through errors from service', async () => {
            const updateData = { firstName: 'Updated Name' };
            const error = new Error('User not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, updateData)).rejects.toThrow('User not found');
        });
    });

    describe('delete', () => {
        it('should delete a user', async () => {
            const deleteResult = { message: 'User deleted successfully' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('User not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('User not found');
        });
    });
});