import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { CustomImagesController } from '../../../src/custom-images/custom-images.controller';
import { CustomImagesService } from '../../../src/custom-images/custom-images.service';
import { CreateCustomImageDto } from '../../../src/custom-images/dto/create-custom-image.dto';
import { UpdateCustomImageDto } from '../../../src/custom-images/dto/update-custom-image.dto';
import { CustomImage } from '../../../src/custom-images/custom-image.entity';
import { AbacGuard } from '../../../src/permissions/guards/abac.guard';

describe('CustomImagesController', () => {
    let controller: CustomImagesController;
    let service: jest.Mocked<CustomImagesService>;

    const mockCustomImage: CustomImage = {
        id: 1,
        image: { id: 1 } as any,
        design: { id: 1 } as any,
        config: { position: 'center', opacity: 0.8 },
    };

    const mockCustomImages: CustomImage[] = [mockCustomImage];

    beforeEach(async () => {
        const mockService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
          controllers: [CustomImagesController],
          providers: [
            {
              provide: CustomImagesService,
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

        controller = module.get<CustomImagesController>(CustomImagesController);
        service = module.get(CustomImagesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all custom images', async () => {
            service.findAll.mockResolvedValue(mockCustomImages);

            const result = await controller.findAll();

            expect(result).toEqual(mockCustomImages);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no custom images exist', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a custom image by id', async () => {
            service.findOne.mockResolvedValue(mockCustomImage);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockCustomImage);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('create', () => {
        const createDto: CreateCustomImageDto = {
            image: 1,
            design: 1,
            config: { position: 'top-left', opacity: 1.0 },
        };

        it('should create and return a custom image', async () => {
            service.create.mockResolvedValue(mockCustomImage);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockCustomImage);
            expect(service.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('update', () => {
        const updateDto: UpdateCustomImageDto = {
            design: 2,
            config: { position: 'center', opacity: 0.9 },
        };

        it('should update and return the custom image', async () => {
          const updatedCustomImage = { ...mockCustomImage, design: { id: 2 } } as CustomImage;
          service.update.mockResolvedValue(updatedCustomImage);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(updatedCustomImage);
            expect(service.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('delete', () => {
        it('should delete a custom image and return success message', async () => {
            service.delete.mockResolvedValue({ message: 'Deleted' });

            const result = await controller.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });
});