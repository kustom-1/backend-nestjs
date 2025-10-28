import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordService } from '../common/password.service';
import { StorageModule } from '../storage/storage.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [StorageModule, PermissionsModule, AuthModule],
  providers: [UsersService, PasswordService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}