import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { AuthUserDto } from '../../../src/auth/dto/auth-user.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let service: jest.Mocked<AuthService>;

    const mockSignInDto: AuthUserDto = {
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const mockAuthResponse = {
        access_token: 'mock.jwt.token',
    };

    beforeEach(async () => {
        const mockAuthService = {
            signIn: jest.fn(),
            validateUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('signIn', () => {
        it('should return access token for valid credentials', async () => {
            service.signIn.mockResolvedValue(mockAuthResponse);

            const result = await controller.signIn(mockSignInDto);

            expect(result).toEqual(mockAuthResponse);
            expect(service.signIn).toHaveBeenCalledWith(
                mockSignInDto.email,
                mockSignInDto.password,
            );
        });

        it('should throw error for invalid credentials', async () => {
            const error = new Error('Invalid credentials');
            service.signIn.mockRejectedValue(error);

            await expect(controller.signIn(mockSignInDto)).rejects.toThrow('Invalid credentials');
        });

        it('should handle service errors properly', async () => {
            const error = new Error('Internal server error');
            service.signIn.mockRejectedValue(error);

            await expect(controller.signIn(mockSignInDto)).rejects.toThrow('Internal server error');
        });
    });
});