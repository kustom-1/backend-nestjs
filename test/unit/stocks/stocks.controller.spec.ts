import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { StocksController } from '../../../src/stocks/stocks.controller';
import { StocksService } from '../../../src/stocks/stocks.service';
import { CreateStockDto } from '../../../src/stocks/dto/create-stock.dto';
import { UpdateStockDto } from '../../../src/stocks/dto/update-stock.dto';
import { Stock } from '../../../src/stocks/stock.entity';
import { AbacGuard } from '../../../src/permissions/guards/abac.guard';

describe('StocksController', () => {
    let controller: StocksController;
    let service: jest.Mocked<StocksService>;

    const mockStock: Stock = {
        id: 1,
        cloth: { id: 1 } as any,
        gender: 'unisex',
        color: 'red',
        size: 'M',
        stock: 10,
    };

    const mockStocks: Stock[] = [mockStock];

    beforeEach(async () => {
        const mockService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [StocksController],
            providers: [
                {
                    provide: StocksService,
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

        controller = module.get<StocksController>(StocksController);
        service = module.get(StocksService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all stocks', async () => {
            service.findAll.mockResolvedValue(mockStocks);

            const result = await controller.findAll();

            expect(result).toEqual(mockStocks);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no stocks exist', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a stock by id', async () => {
            service.findOne.mockResolvedValue(mockStock);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockStock);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('create', () => {
        const createDto: CreateStockDto = {
            cloth: 1,
            gender: 'unisex',
            color: 'red',
            size: 'M',
            stock: 10,
        };

        it('should create and return a stock', async () => {
            service.create.mockResolvedValue(mockStock);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockStock);
            expect(service.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('update', () => {
        const updateDto: UpdateStockDto = {
            gender: 'male',
            color: 'blue',
            size: 'L',
            stock: 20,
        };

        it('should update and return the stock', async () => {
            const updatedStock = { ...mockStock, stock: 20 };
            service.update.mockResolvedValue(updatedStock);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(updatedStock);
            expect(service.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('delete', () => {
        it('should delete a stock and return success message', async () => {
            service.delete.mockResolvedValue({ message: 'Deleted' });

            const result = await controller.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });
});