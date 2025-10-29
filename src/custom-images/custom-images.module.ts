import { Module } from '@nestjs/common';
import { CustomImagesService } from './custom-images.service';
import { CustomImagesController } from './custom-images.controller';
import { StorageModule } from '../storage/storage.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, PermissionsModule, AuthModule],
  providers: [CustomImagesService],
  controllers: [CustomImagesController],
  exports: [CustomImagesService],
})
export class CustomImagesModule {}
