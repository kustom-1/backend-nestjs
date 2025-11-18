import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordService } from '../common/password.service';
import { StorageModule } from '../storage/storage.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, PermissionsModule, AuthModule],
  providers: [UsersService, PasswordService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}