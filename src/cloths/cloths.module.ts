import { Module } from '@nestjs/common';
import { ClothsService } from './cloths.service';
import { ClothsResolver } from './cloths.resolver';
import { StorageModule } from '../storage/storage.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, PermissionsModule, AuthModule],
  providers: [ClothsService, ClothsResolver],
  exports: [ClothsService],
})
export class ClothsModule {}
