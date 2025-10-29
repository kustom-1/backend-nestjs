import { Module } from '@nestjs/common';
import { ClothsService } from './cloths.service';
import { ClothsController } from './cloths.controller';
import { StorageModule } from '../storage/storage.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, PermissionsModule, AuthModule],
  providers: [ClothsService],
  controllers: [ClothsController],
  exports: [ClothsService],
})
export class ClothsModule {}
