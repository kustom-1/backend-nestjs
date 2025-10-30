import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { DesignHistoryController } from '../../../src/design-history/design-history.controller';
import { DesignHistoryService } from '../../../src/design-history/design-history.service';
import { CreateDesignHistoryDto } from '../../../src/design-history/dto/create-design-history.dto';
import { UpdateDesignHistoryDto } from '../../../src/design-history/dto/update-design-history.dto';
import { DesignHistory } from '../../../src/design-history/design-history.entity';
import { AbacGuard } from '../../../src/permissions/guards/abac.guard';

describe('DesignHistoryController', () => {
    let controller: DesignHistoryController;
    let service: jest.Mocked<DesignHistoryService>;

    const mockDesignHistory: DesignHistory = {
        id: 1,
        design: { id: 1 } as any,
        version: 1,
        dataSnapshot: { color: 'red', size: 'M' },
        createdAt: new Date('2023-01-01'),
        order: { id: 1 } as any,
    };

    const mockDesignHistories: DesignHistory[] = [mockDesignHistory];

    beforeEach(async () => {
        const mockService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
          controllers: [DesignHistoryController],
          providers: [
            {
              provide: DesignHistoryService,
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

        controller = module.get<DesignHistoryController>(DesignHistoryController);
        service = module.get(DesignHistoryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all design histories', async () => {
            service.findAll.mockResolvedValue(mockDesignHistories);

            const result = await controller.findAll();

            expect(result).toEqual(mockDesignHistories);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no design histories exist', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a design history by id', async () => {
            service.findOne.mockResolvedValue(mockDesignHistory);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockDesignHistory);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('create', () => {
        const createDto: CreateDesignHistoryDto = {
            designId: 1,
            version: 2,
            dataSnapshot: { color: 'blue', size: 'L' },
            createdAt: '2023-01-02T00:00:00.000Z',
            order: 2,
        };

        it('should create and return a design history', async () => {
            service.create.mockResolvedValue(mockDesignHistory);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockDesignHistory);
            expect(service.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('update', () => {
        const updateDto: UpdateDesignHistoryDto = {
            dataSnapshot: { color: 'purple', size: 'XL' },
            version: 3,
        };

        it('should update and return the design history', async () => {
            const updatedDesignHistory = { ...mockDesignHistory, version: 3 };
            service.update.mockResolvedValue(updatedDesignHistory);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(updatedDesignHistory);
            expect(service.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('delete', () => {
        it('should delete a design history and return success message', async () => {
            service.delete.mockResolvedValue({ message: 'Deleted' });

            const result = await controller.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });
});