import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsController } from '../../../src/transactions/transactions.controller';
import { TransactionsService } from '../../../src/transactions/transactions.service';
import { CreateTransactionDto } from '../../../src/transactions/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../../src/transactions/dto/update-transaction.dto';
import { Transaction } from '../../../src/transactions/transaction.entity';
import { AbacGuard } from '../../../src/permissions/guards/abac.guard';

describe('TransactionsController', () => {
    let controller: TransactionsController;
    let service: jest.Mocked<TransactionsService>;

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
        const mockService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
          controllers: [TransactionsController],
          providers: [
            {
              provide: TransactionsService,
              useValue: mockService,
            },
            {
              provide: 'PermissionsService',
              useValue: {},
            },
          ],
        })
        .overrideGuard(AuthGuard('jwt'))
        .useValue({ canActivate: () => true })
        .overrideGuard(AbacGuard)
        .useValue({ canActivate: () => true })
        .compile();

        controller = module.get<TransactionsController>(TransactionsController);
        service = module.get(TransactionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all transactions', async () => {
            service.findAll.mockResolvedValue(mockTransactions);

            const result = await controller.findAll();

            expect(result).toEqual(mockTransactions);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no transactions exist', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a transaction by id', async () => {
            service.findOne.mockResolvedValue(mockTransaction);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockTransaction);
            expect(service.findOne).toHaveBeenCalledWith(1);
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
            service.create.mockResolvedValue(mockTransaction);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockTransaction);
            expect(service.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('update', () => {
        const updateDto: UpdateTransactionDto = {
            amount: 200.00,
            method: 'debit_card',
            status: 'refunded',
        };

        it('should update and return the transaction', async () => {
            const updatedTransaction = { ...mockTransaction, amount: 200.00 };
            service.update.mockResolvedValue(updatedTransaction);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(updatedTransaction);
            expect(service.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('delete', () => {
        it('should delete a transaction and return success message', async () => {
            service.delete.mockResolvedValue({ message: 'Deleted' });

            const result = await controller.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });
});