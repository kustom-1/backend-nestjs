import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { Repository } from 'typeorm';
import { User } from "./users.entity";
import { PasswordService } from '../common/password.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService implements OnModuleInit {
    private userRepository: Repository<User>;

    constructor(
        private storageService: StorageService,
        private passwordService: PasswordService,
    ) {}

    async onModuleInit() {
        // Conectar a la base de datos al inicializar el módulo
        await this.storageService.connect();
        this.userRepository = this.storageService.getRepository(User);
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with ID '${id}' not found`);
        return user;
    }

    async findByFirstName(firstName: string): Promise<User> {
        return await this.userRepository.findOne({ where: { firstName } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const exists = await this.userRepository.findOne({ where: { email: userData.email } });
        if (exists) throw new BadRequestException('Email not available');
        try {
            const hashedPassword = await this.passwordService.hashPassword(userData.password);
            const user = this.userRepository.create({
                ...userData,
                password: hashedPassword,
            });
            return await this.userRepository.save(user);
        } catch (error) {
            throw new InternalServerErrorException('Error creating user');
        }
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async update(id: number, userData: Partial<User>): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, userData);
        try {
            return await this.userRepository.save(user);
        } catch (error) {
            throw new InternalServerErrorException('Error updating user');
        }
    }

    async delete(id: number): Promise<{ message: string }> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`User with ID '${id}' not found`);
        return { message: 'User deleted successfully' };
    }
}