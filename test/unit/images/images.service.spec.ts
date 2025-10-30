import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ImagesService } from '../../../src/images/images.service';
import { StorageService } from '../../../src/storage/storage.service';
import { Image } from '../../../src/images/image.entity';
import { mockRepository } from '../setup';

describe('ImagesService', () => {
    let service: ImagesService;
    let storageService: jest.Mocked<StorageService>;

    const mockImage: Image = {
        id: 1,
        url: 'test-image-url',
        tags: ['tag1', 'tag2'],
        isPublic: true,
        user: { id: 1 } as any,
    };

    beforeEach(async () => {
        const mockStorageService = {
            connect: jest.fn(),
            getRepository: jest.fn().mockReturnValue(mockRepository),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImagesService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<ImagesService>(ImagesService);
        storageService = module.get(StorageService);

        // Initialize the service
        await service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all images with relations', async () => {
            const images = [mockImage];
            mockRepository.find.mockResolvedValue(images);

            const result = await service.findAll();

            expect(result).toEqual(images);
            expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['user'] });
        });
    });

    describe('findOne', () => {
        it('should return an image by id with relations', async () => {
            mockRepository.findOne.mockResolvedValue(mockImage);

            const result = await service.findOne(1);

            expect(result).toEqual(mockImage);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user']
            });
        });

        it('should throw NotFoundException if image not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Image 999 not found');
        });
    });

    describe('create', () => {
        it('should create a new image with user and tags', async () => {
            const createData = {
                url: 'new-image-url',
                alt: 'New Image',
                tags: ['new-tag'],
                isPublic: false,
                user: 1,
            };
            const createdImage = { ...mockImage, ...createData };

            mockRepository.create.mockReturnValue(createdImage);
            mockRepository.save.mockResolvedValue(createdImage);

            const result = await service.create(createData);

            expect(result).toEqual(createdImage);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
                tags: createData.tags,
            });
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should create a new image without user', async () => {
            const createData = {
                url: 'new-image-url',
                alt: 'New Image',
                tags: ['new-tag'],
                isPublic: true,
            };
            const createdImage = { ...mockImage, ...createData, user: null };

            mockRepository.create.mockReturnValue(createdImage);
            mockRepository.save.mockResolvedValue(createdImage);

            const result = await service.create(createData);

            expect(result).toEqual(createdImage);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: null,
                tags: createData.tags,
            });
        });

        it('should create a new image without tags', async () => {
            const createData = {
                url: 'new-image-url',
                alt: 'New Image',
                isPublic: true,
                user: 1,
            };
            const createdImage = { ...mockImage, ...createData, tags: null };

            mockRepository.create.mockReturnValue(createdImage);
            mockRepository.save.mockResolvedValue(createdImage);

            const result = await service.create(createData);

            expect(result).toEqual(createdImage);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createData,
                user: { id: createData.user },
                tags: null,
            });
        });

        it('should throw InternalServerErrorException on save error', async () => {
            const createData = {
                url: 'new-image-url',
                alt: 'New Image',
                tags: ['new-tag'],
                isPublic: false,
                user: 1,
            };
            mockRepository.create.mockReturnValue(mockImage);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createData)).rejects.toThrow(InternalServerErrorException);
            await expect(service.create(createData)).rejects.toThrow('Error creating image');
        });
    });

    describe('update', () => {
        it('should update an image with all fields', async () => {
            const updateData = {
                url: 'updated-image-url',
                tags: ['updated-tag'],
                isPublic: false,
                user: 2,
            };
            const updatedImage = {
                ...mockImage,
                tags: ['updated-tag'],
                isPublic: false,
                user: { id: 2 } as any
            };

            mockRepository.findOne.mockResolvedValue(mockImage);
            mockRepository.save.mockResolvedValue(updatedImage);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedImage);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedImage);
        });

        it('should update an image with partial fields', async () => {
            const updateData = { tags: ['updated-tag'] };
            const updatedImage = { ...mockImage, tags: ['updated-tag'] };

            mockRepository.findOne.mockResolvedValue(mockImage);
            mockRepository.save.mockResolvedValue(updatedImage);

            const result = await service.update(1, updateData);

            expect(result).toEqual(updatedImage);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedImage);
        });

        it('should throw NotFoundException if image not found for update', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, { url: 'new-url' })).rejects.toThrow(NotFoundException);
            await expect(service.update(999, { url: 'new-url' })).rejects.toThrow('Image 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete an image', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'Deleted' });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if image not found for deletion', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            await expect(service.delete(999)).rejects.toThrow('Image 999 not found');
        });
    });
});