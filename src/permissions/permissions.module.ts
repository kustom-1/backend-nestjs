import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsInitializerService } from './permissions-initializer.service';
import { StorageModule } from '../storage/storage.module';
import { AbacGuard } from './guards/abac.guard';
import { GqlAbacGuard } from './guards/gql-abac.guard';
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
    GqlAbacGuard,
    ConditionalUserCreationGuard
  ],
  exports: [
    PermissionsService,
    PermissionsInitializerService,
    AbacGuard,
    GqlAbacGuard,
    ConditionalUserCreationGuard
  ], 
})
export class PermissionsModule {}