import { Module } from '@nestjs/common';
import { DesignHistoryService } from './design-history.service';
import { DesignHistoryController } from './design-history.controller';
import { StorageModule } from '../storage/storage.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, PermissionsModule, AuthModule],
  providers: [DesignHistoryService],
  controllers: [DesignHistoryController],
  exports: [DesignHistoryService],
})
export class DesignHistoryModule {}
