import { Test, TestingModule } from '@nestjs/testing';
import { DesignsController } from '../../../src/designs/designs.controller';
import { DesignsService } from '../../../src/designs/designs.service';
import { Design } from '../../../src/designs/design.entity';
import { CreateDesignDto } from '../../../src/designs/dto/create-design.dto';
import { UpdateDesignDto } from '../../../src/designs/dto/update-design.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('DesignsController', () => {
    let controller: DesignsController;
    let service: jest.Mocked<DesignsService>;

    const mockDesign: Design = {
        id: 1,
        user: { id: 1 } as any,
        cloth: { id: 1 } as any,
        isPublic: false,
        isActive: true,
    };

    const mockDesigns: Design[] = [mockDesign];

    const mockCreateDesignDto: CreateDesignDto = {
        user: 1,
        cloth: 1,
        isPublic: true,
        isActive: false,
    };

    const mockUpdateDesignDto: UpdateDesignDto = {
        isPublic: true,
        isActive: false,
    };

    beforeEach(async () => {
        const mockDesignsService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DesignsController],
            providers: [
                {
                    provide: DesignsService,
                    useValue: mockDesignsService,
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

        controller = module.get<DesignsController>(DesignsController);
        service = module.get(DesignsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all designs', async () => {
            service.findAll.mockResolvedValue(mockDesigns);

            const result = await controller.findAll();

            expect(result).toEqual(mockDesigns);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a design by id', async () => {
            service.findOne.mockResolvedValue(mockDesign);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockDesign);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Design not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('Design not found');
        });
    });

    describe('create', () => {
        it('should create a new design', async () => {
            service.create.mockResolvedValue(mockDesign);

            const result = await controller.create(mockCreateDesignDto);

            expect(result).toEqual(mockDesign);
            expect(service.create).toHaveBeenCalledWith(mockCreateDesignDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Error creating design');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateDesignDto)).rejects.toThrow('Error creating design');
        });
    });

    describe('update', () => {
        it('should update a design', async () => {
            const updatedDesign = { ...mockDesign, isPublic: true, isActive: false };
            service.update.mockResolvedValue(updatedDesign);

            const result = await controller.update(1, mockUpdateDesignDto);

            expect(result).toEqual(updatedDesign);
            expect(service.update).toHaveBeenCalledWith(1, mockUpdateDesignDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Design not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, mockUpdateDesignDto)).rejects.toThrow('Design not found');
        });
    });

    describe('delete', () => {
        it('should delete a design', async () => {
            const deleteResult = { message: 'Deleted' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Design not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('Design not found');
        });
    });
});