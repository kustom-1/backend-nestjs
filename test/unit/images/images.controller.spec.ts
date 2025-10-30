import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from '../../../src/images/images.controller';
import { ImagesService } from '../../../src/images/images.service';
import { Image } from '../../../src/images/image.entity';
import { CreateImageDto } from '../../../src/images/dto/create-image.dto';
import { UpdateImageDto } from '../../../src/images/dto/update-image.dto';
import { PermissionsService } from '../../../src/permissions/permissions.service';

describe('ImagesController', () => {
    let controller: ImagesController;
    let service: jest.Mocked<ImagesService>;

    const mockImage: Image = {
        id: 1,
        url: 'test-image-url',
        tags: ['tag1', 'tag2'],
        isPublic: true,
        user: { id: 1 } as any,
    };

    const mockImages: Image[] = [mockImage];

    const mockCreateImageDto: CreateImageDto = {
        url: 'new-image-url',
        tags: ['new-tag'],
        isPublic: false,
        user: 2,
    };

    const mockUpdateImageDto: UpdateImageDto = {
        url: 'updated-image-url',
        tags: ['updated-tag'],
        isPublic: true,
        user: 3,
    };

    beforeEach(async () => {
        const mockImagesService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImagesController],
            providers: [
                {
                    provide: ImagesService,
                    useValue: mockImagesService,
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

        controller = module.get<ImagesController>(ImagesController);
        service = module.get(ImagesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all images', async () => {
            service.findAll.mockResolvedValue(mockImages);

            const result = await controller.findAll();

            expect(result).toEqual(mockImages);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return an image by id', async () => {
            service.findOne.mockResolvedValue(mockImage);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockImage);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Image not found');
            service.findOne.mockRejectedValue(error);

            await expect(controller.findOne(999)).rejects.toThrow('Image not found');
        });
    });

    describe('create', () => {
        it('should create a new image', async () => {
            service.create.mockResolvedValue(mockImage);

            const result = await controller.create(mockCreateImageDto);

            expect(result).toEqual(mockImage);
            expect(service.create).toHaveBeenCalledWith(mockCreateImageDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Error creating image');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateImageDto)).rejects.toThrow('Error creating image');
        });
    });

    describe('update', () => {
        it('should update an image', async () => {
            const updatedImage = {
                ...mockImage,
                url: 'updated-image-url',
                tags: ['updated-tag'],
                isPublic: true,
                user: { id: 3 } as any
            };
            service.update.mockResolvedValue(updatedImage);

            const result = await controller.update(1, mockUpdateImageDto);

            expect(result).toEqual(updatedImage);
            expect(service.update).toHaveBeenCalledWith(1, mockUpdateImageDto);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Image not found');
            service.update.mockRejectedValue(error);

            await expect(controller.update(1, mockUpdateImageDto)).rejects.toThrow('Image not found');
        });
    });

    describe('delete', () => {
        it('should delete an image', async () => {
            const deleteResult = { message: 'Deleted' };
            service.delete.mockResolvedValue(deleteResult);

            const result = await controller.delete(1);

            expect(result).toEqual(deleteResult);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should pass through errors from service', async () => {
            const error = new Error('Image not found');
            service.delete.mockRejectedValue(error);

            await expect(controller.delete(999)).rejects.toThrow('Image not found');
        });
    });
});