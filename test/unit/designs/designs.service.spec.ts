import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DesignsService } from '../../../src/designs/designs.service';
import { StorageService } from '../../../src/storage/storage.service';
import { Design } from '../../../src/designs/design.entity';
import { mockRepository } from '../setup';

describe('DesignsService', () => {
    let service: DesignsService;
    let storageService: jest.Mocked<StorageService>;

    const mockDesign: Design = {
        id: 1,
        user: { id: 1 } as any,
        cloth: { id: 1 } as any,
        isPublic: false,
        isActive: true,
    };

    beforeEach(async () => {
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DesignsService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<DesignsService>(DesignsService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all designs with relations', async () => {
            const designs = [mockDesign];
            mockRepository.find.mockResolvedValue(designs);

            const result = await service.findAll();

            expect(result).toEqual(designs);
            expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['user', 'cloth'] });
        });
    });

    describe('findOne', () => {
        it('should return a design by id with relations', async () => {
            mockRepository.findOne.mockResolvedValue(mockDesign);

            const result = await service.findOne(1);

            expect(result).toEqual(mockDesign);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'cloth']
            });
        });

        it('should throw NotFoundException if design not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Design 999 not found');
        });
    });

    describe('create', () => {
        it('should create a new design with all fields', async () => {
            const createData = { user: 1, cloth: 1, isPublic: true, isActive: false };
            const createdDesign = { ...mockDesign, ...createData };

            mockRepository.create.mockReturnValue(createdDesign);
            mockRepository.save.mockResolvedValue(createdDesign);

            const result = await service.create(createData);

            expect(result).toEqual(createdDesign);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
                cloth: { id: createData.cloth },
            });
        });

        it('should create a new design with optional fields', async () => {
            const createData = {};
            const createdDesign = { ...mockDesign, user: null, cloth: null };

            mockRepository.create.mockReturnValue(createdDesign);
            mockRepository.save.mockResolvedValue(createdDesign);

            const result = await service.create(createData);

            expect(result).toEqual(createdDesign);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: null,
                cloth: null,
            });
        });

        it('should throw InternalServerErrorException on save error', async () => {
            const createData = { user: 1 };
            mockRepository.create.mockReturnValue(mockDesign);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createData)).rejects.toThrow(InternalServerErrorException);
            await expect(service.create(createData)).rejects.toThrow('Error creating design');
        });
    });

    describe('update', () => {
        it('should update a design with all fields', async () => {
            const updateData = { user: 2, cloth: 2, isPublic: true, isActive: false };
            const updatedDesign = {
                ...mockDesign,
                user: { id: 2 } as any,
                cloth: { id: 2 } as any,
                isPublic: true,
                isActive: false
            };

            mockRepository.findOne.mockResolvedValue(mockDesign);
            mockRepository.save.mockResolvedValue(updatedDesign);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedDesign);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedDesign);
        });

        it('should update a design with partial fields', async () => {
            const updateData = { isPublic: true };
            const updatedDesign = { ...mockDesign, isPublic: true };

            mockRepository.findOne.mockResolvedValue(mockDesign);
            mockRepository.save.mockResolvedValue(updatedDesign);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedDesign);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedDesign);
        });

        it('should update a design without changing relations', async () => {
            const updateData = {};
            const updatedDesign = { ...mockDesign };

            mockRepository.findOne.mockResolvedValue(mockDesign);
            mockRepository.save.mockResolvedValue(updatedDesign);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedDesign);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedDesign);
        });

        it('should throw NotFoundException if design not found for update', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, { isPublic: true })).rejects.toThrow(NotFoundException);
            await expect(service.update(999, { isPublic: true })).rejects.toThrow('Design 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete a design', async () => {
            mockRepository.findOne.mockResolvedValue(mockDesign);
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if design not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Design 999 not found');
        });
    });
});