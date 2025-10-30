import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Mock TypeORM repository
export const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
        execute: jest.fn(),
    })),
};

// Mock Mongoose model
export const mockMongooseModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
};

// Global test setup
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
});

afterAll(async () => {
    // Clean up after all tests
});

afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
});

// Helper function to create testing module with mocked dependencies
export async function createTestingModule(
    moduleClass: any,
    providers: any[] = [],
    controllers: any[] = [],
) {
    const moduleRef = await Test.createTestingModule({
        imports: [moduleClass],
        providers: [
            ...providers,
        ],
        controllers,
    })
        .overrideProvider(getRepositoryToken(User))
        .useValue(mockRepository)
        .compile();

    return moduleRef;
}

// Import commonly used entities for mocking
import { User } from '../../src/users/users.entity';

// Export common mocks
export { mockRepository as MockRepository, mockMongooseModel as MockMongooseModel };