import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CustomImagesService } from '../../../src/custom-images/custom-images.service';
import { CustomImage } from '../../../src/custom-images/custom-image.entity';
import { StorageService } from '../../../src/storage/storage.service';
import { CreateCustomImageDto } from '../../../src/custom-images/dto/create-custom-image.dto';
import { UpdateCustomImageDto } from '../../../src/custom-images/dto/update-custom-image.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('CustomImagesService', () => {
    let service: CustomImagesService;
    let mockRepo: jest.Mocked<Repository<CustomImage>>;
    let mockStorageService: jest.Mocked<StorageService>;

    const mockCustomImage: CustomImage = {
        id: 1,
        image: { id: 1 } as any,
        design: { id: 1 } as any,
        config: { position: 'center', opacity: 0.8 },
    };

    const mockCustomImages: CustomImage[] = [mockCustomImage];

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
                CustomImagesService,
                {
                    provide: StorageService,
                    useValue: mockStorageServiceValue,
                },
            ],
        }).compile();

        service = module.get<CustomImagesService>(CustomImagesService);
        mockRepo = mockRepository as any;
        mockStorageService = mockStorageServiceValue as any;

        // Initialize the service
        await service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all custom images with relations', async () => {
            mockRepo.find.mockResolvedValue(mockCustomImages);

            const result = await service.findAll();

            expect(result).toEqual(mockCustomImages);
            expect(mockRepo.find).toHaveBeenCalledWith({ relations: ['image', 'design'] });
        });

        it('should return empty array when no custom images exist', async () => {
            mockRepo.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a custom image when found', async () => {
            mockRepo.findOne.mockResolvedValue(mockCustomImage);

            const result = await service.findOne(1);

            expect(result).toEqual(mockCustomImage);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['image', 'design']
            });
        });

        it('should throw NotFoundException when custom image not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        const createDto: CreateCustomImageDto = {
            image: 1,
            design: 1,
            config: { position: 'top-left', opacity: 1.0 },
        };

        it('should create and return a custom image', async () => {
            const createdEntity = { ...mockCustomImage, config: { position: 'top-left', opacity: 1.0 } };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(createDto);

            expect(result).toEqual(createdEntity);
            expect(mockRepo.create).toHaveBeenCalledWith({
                image: { id: 1 },
                design: { id: 1 },
                config: { position: 'top-left', opacity: 1.0 },
            });
            expect(mockRepo.save).toHaveBeenCalledWith(createdEntity);
        });

        it('should create custom image without design', async () => {
            const dtoWithoutDesign: CreateCustomImageDto = {
                image: 1,
                config: { position: 'bottom', opacity: 0.5 },
            };

            const createdEntity = {
                ...mockCustomImage,
                design: null,
                config: { position: 'bottom', opacity: 0.5 },
            };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(dtoWithoutDesign);

            expect(result.design).toBeNull();
            expect(mockRepo.create).toHaveBeenCalledWith({
                image: { id: 1 },
                design: null,
                config: { position: 'bottom', opacity: 0.5 },
            });
        });

        it('should create custom image without config', async () => {
            const dtoWithoutConfig: CreateCustomImageDto = {
                image: 1,
                design: 2,
            };

            const createdEntity = {
                ...mockCustomImage,
                design: { id: 2 },
                config: undefined,
            };
            mockRepo.create.mockReturnValue(createdEntity as any);
            mockRepo.save.mockResolvedValue(createdEntity as any);

            const result = await service.create(dtoWithoutConfig);

            expect(result.config).toBeUndefined();
        });

        it('should throw InternalServerErrorException on database error', async () => {
            mockRepo.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateCustomImageDto = {
            design: 2,
            config: { position: 'center', opacity: 0.9 },
        };

        it('should update and return the custom image', async () => {
            const existingCustomImage = { ...mockCustomImage };
            const updatedCustomImage = {
                ...existingCustomImage,
                design: { id: 2 },
                config: { position: 'center', opacity: 0.9 },
            };

            mockRepo.findOne.mockResolvedValue(existingCustomImage);
            mockRepo.save.mockResolvedValue(updatedCustomImage as any);

            const result = await service.update(1, updateDto);

            expect(result).toEqual(updatedCustomImage);
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['image', 'design']
            });
            expect(mockRepo.save).toHaveBeenCalledWith(updatedCustomImage);
        });

        it('should update only provided fields', async () => {
            const partialUpdateDto: UpdateCustomImageDto = {
                config: { position: 'top', opacity: 0.7 },
            };

            const existingCustomImage = { ...mockCustomImage };
            const updatedCustomImage = {
                ...existingCustomImage,
                config: { position: 'top', opacity: 0.7 },
            };

            mockRepo.findOne.mockResolvedValue(existingCustomImage);
            mockRepo.save.mockResolvedValue(updatedCustomImage as any);

            const result = await service.update(1, partialUpdateDto);

            expect(result.config).toEqual({ position: 'top', opacity: 0.7 });
            expect(result.design).toEqual(mockCustomImage.design); // unchanged
        });

        it('should update design to null', async () => {
            const updateDtoWithNullDesign: UpdateCustomImageDto = {
                design: null,
            };

            const existingCustomImage = { ...mockCustomImage };
            const updatedCustomImage = {
                ...existingCustomImage,
                design: null,
            };

            mockRepo.findOne.mockResolvedValue(existingCustomImage);
            mockRepo.save.mockResolvedValue(updatedCustomImage as any);

            const result = await service.update(1, updateDtoWithNullDesign);

            expect(result.design).toBeNull();
        });

        it('should throw NotFoundException when updating non-existent custom image', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete custom image and return success message', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepo.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when custom image not found', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        });
    });
});