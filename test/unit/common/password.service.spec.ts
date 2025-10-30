import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../../../src/common/password.service';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('PasswordService', () => {
    let service: PasswordService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PasswordService],
        }).compile();

        service = module.get<PasswordService>(PasswordService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hashPassword', () => {
        it('should hash password with correct salt rounds', async () => {
            const plainPassword = 'testPassword123';
            const hashedPassword = 'hashedPassword123';

            (mockedBcrypt.hash as any).mockResolvedValue(hashedPassword);

            const result = await service.hashPassword(plainPassword);

            expect(result).toBe(hashedPassword);
            expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
        });

        it('should handle bcrypt errors', async () => {
            const plainPassword = 'testPassword123';
            const error = new Error('Hashing failed');

            (mockedBcrypt.hash as any).mockRejectedValue(error);

            await expect(service.hashPassword(plainPassword)).rejects.toThrow('Hashing failed');
        });
    });

    describe('comparePasswords', () => {
        it('should return true for matching passwords', async () => {
            const plainPassword = 'testPassword123';
            const hashedPassword = 'hashedPassword123';

            (mockedBcrypt.compare as any).mockResolvedValue(true);

            const result = await service.comparePasswords(plainPassword, hashedPassword);

            expect(result).toBe(true);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
        });

        it('should return false for non-matching passwords', async () => {
            const plainPassword = 'testPassword123';
            const hashedPassword = 'differentHashedPassword';

            (mockedBcrypt.compare as any).mockResolvedValue(false);

            const result = await service.comparePasswords(plainPassword, hashedPassword);

            expect(result).toBe(false);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
        });

        it('should handle bcrypt compare errors', async () => {
            const plainPassword = 'testPassword123';
            const hashedPassword = 'hashedPassword123';
            const error = new Error('Comparison failed');

            (mockedBcrypt.compare as any).mockRejectedValue(error);

            await expect(service.comparePasswords(plainPassword, hashedPassword)).rejects.toThrow(
                'Comparison failed',
            );
        });
    });
});