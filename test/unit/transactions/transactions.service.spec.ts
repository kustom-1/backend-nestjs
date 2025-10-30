import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsService } from '../../../src/transactions/transactions.service';
import { Transaction } from '../../../src/transactions/transaction.entity';
import { StorageService } from '../../../src/storage/storage.service';
import { CreateTransactionDto } from '../../../src/transactions/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../../src/transactions/dto/update-transaction.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('TransactionsService', () => {
    let service: TransactionsService;
    let mockRepo: jest.Mocked<Repository<Transaction>>;
    let mockStorageService: jest.Mocked<StorageService>;

    const mockTransaction: Transaction = {
        id: 1,
        amount: 100.50,
        method: 'credit_card',
        status: 'completed',
        transactionDate: new Date('2023-01-01'),
        order: { id: 1 } as any,
    };

    const mockTransactions: Transaction[] = [mockTransaction];

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
                TransactionsService,
                {
                    provide: StorageService,
                    useValue: mockStorageServiceValue,
                },
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);
        mockRepo = mockRepository as any;
        mockStorageService = mockStorageServiceValue as any;

        // Initialize the service
        await service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all transactions with relations', async () => {
            mockRepo.find.mockResolvedValue(mockTransactions);

            const result = await service.findAll();

            expect(result).toEqual(mockTransactions);
            expect(mockRepo.find).toHaveBeenCalledWith({ relations: ['order'] });
        });

        it('should return empty array when no transactions exist', async () => {
            mockRepo.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(mockRepo.find).toHaveBeenCalledWith({ relations: ['order'] });
        });
    });

    describe('findOne', () => {
        it('should return a transaction when found', async () => {
            mockRepo.findOne.mockResolvedValue(mockTransaction);

            const result = await service.findOne(1);

            expect(result).toEqual(mockTransaction);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['order']
            });
        });

        it('should throw NotFoundException when transaction not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 999 },
                relations: ['order']
            });
        });
    });

    describe('create', () => {
        const createDto: CreateTransactionDto = {
            amount: 100.50,
            method: 'credit_card',
            status: 'completed',
            order: 1,
            transactionDate: '2023-01-01T00:00:00.000Z',
        };

        it('should create and return a transaction', async () => {
            const createdEntity = { ...mockTransaction };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(createDto);

            expect(result).toEqual(createdEntity);
            expect(mockRepo.create).toHaveBeenCalledWith({
                amount: 100.50,
                method: 'credit_card',
                status: 'completed',
                order: { id: 1 },
                transactionDate: new Date('2023-01-01T00:00:00.000Z'),
            });
            expect(mockRepo.save).toHaveBeenCalledWith(createdEntity);
        });

        it('should create transaction without order', async () => {
            const dtoWithoutOrder: CreateTransactionDto = {
                amount: 50.00,
                method: 'cash',
                status: 'pending',
            };

            const createdEntity = {
                id: 2,
                amount: 50.00,
                method: 'cash',
                status: 'pending',
                order: null,
            };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(dtoWithoutOrder);

            expect(result).toEqual(createdEntity);
            expect(mockRepo.create).toHaveBeenCalledWith({
                amount: 50.00,
                method: 'cash',
                status: 'pending',
                order: null,
                transactionDate: null,
            });
        });

        it('should throw InternalServerErrorException on database error', async () => {
            mockRepo.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateTransactionDto = {
            amount: 200.00,
            method: 'debit_card',
            status: 'refunded',
            order: 2,
            transactionDate: '2023-01-02T00:00:00.000Z',
        };

        it('should update and return the transaction', async () => {
            const existingTransaction = { ...mockTransaction };
            const updatedTransaction = {
                ...existingTransaction,
                amount: 200.00,
                method: 'debit_card',
                status: 'refunded',
                order: { id: 2 },
                transactionDate: new Date('2023-01-02T00:00:00.000Z'),
            };

            mockRepo.findOne.mockResolvedValue(existingTransaction);
            mockRepo.save.mockResolvedValue(updatedTransaction as any);

            const result = await service.update(1, updateDto);

            expect(result).toEqual(updatedTransaction);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['order']
            });
            expect(mockRepo.save).toHaveBeenCalledWith(updatedTransaction);
        });

        it('should update only provided fields', async () => {
            const partialUpdateDto: UpdateTransactionDto = {
                amount: 150.00,
            };

            const existingTransaction = { ...mockTransaction };
            const updatedTransaction = {
                ...existingTransaction,
                amount: 150.00,
            };

            mockRepo.findOne.mockResolvedValue(existingTransaction);
            mockRepo.save.mockResolvedValue(updatedTransaction as any);

            const result = await service.update(1, partialUpdateDto);

            expect(result.amount).toBe(150.00);
            expect(result.method).toBe(mockTransaction.method); // unchanged
        });

        it('should throw NotFoundException when updating non-existent transaction', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete transaction and return success message', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepo.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when transaction not found', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        });
    });
});