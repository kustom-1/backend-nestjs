import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/auth/auth.service';
import { UsersService } from '../../../src/users/users.service';
import { PasswordService } from '../../../src/common/password.service';
import { User } from '../../../src/users/users.entity';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let jwtService: jest.Mocked<JwtService>;
    let passwordService: jest.Mocked<PasswordService>;

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
        const mockUsersService = {
            findByEmail: jest.fn(),
        };

        const mockJwtService = {
            signAsync: jest.fn(),
        };

        const mockPasswordService = {
            comparePasswords: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: PasswordService,
                    useValue: mockPasswordService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        jwtService = module.get(JwtService);
        passwordService = module.get(PasswordService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signIn', () => {
        it('should return access token for valid credentials', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            passwordService.comparePasswords.mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValue('mockAccessToken');

            const result = await service.signIn('john.doe@example.com', 'password123');

            expect(result).toEqual({ access_token: 'mockAccessToken' });
            expect(usersService.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
            expect(passwordService.comparePasswords).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwtService.signAsync).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            usersService.findByEmail.mockResolvedValue(null);

            await expect(service.signIn('invalid@example.com', 'password')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            passwordService.comparePasswords.mockResolvedValue(false);

            await expect(service.signIn('john.doe@example.com', 'wrongpassword')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('validateUser', () => {
        it('should return user for valid credentials', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            passwordService.comparePasswords.mockResolvedValue(true);

            const result = await service.validateUser('john.doe@example.com', 'password123');

            expect(result).toEqual(mockUser);
            expect(usersService.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
            expect(passwordService.comparePasswords).toHaveBeenCalledWith('password123', 'hashedPassword');
        });

        it('should return null for invalid email', async () => {
            usersService.findByEmail.mockResolvedValue(null);

            const result = await service.validateUser('invalid@example.com', 'password');

            expect(result).toBeNull();
        });

        it('should return null for invalid password', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            passwordService.comparePasswords.mockResolvedValue(false);

            const result = await service.validateUser('john.doe@example.com', 'wrongpassword');

            expect(result).toBeNull();
        });
    });
});