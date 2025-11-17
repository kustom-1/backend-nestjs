import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { RolePermissionsController } from './role-permissions.controller';
import { PermissionsInitializerService } from './permissions-initializer.service';
import { StorageModule } from '../storage/storage.module';
import { AbacGuard } from './guards/abac.guard';
import { ConditionalUserCreationGuard } from './guards/conditional-user-creation.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    StorageModule,
    AuthModule,
  ],
  providers: [
    PermissionsService,
    PermissionsInitializerService,
    AbacGuard,
    ConditionalUserCreationGuard
  ],
  controllers: [
    RolePermissionsController
  ],
  exports: [
    PermissionsService,
    PermissionsInitializerService,
    AbacGuard,
    ConditionalUserCreationGuard
  ], 
})
export class PermissionsModule {}