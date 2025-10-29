import { Module } from '@nestjs/common';
import { CartDesignService } from './cart-design.service';
import { CartDesignController } from './cart-design.controller';
import { StorageModule } from '../storage/storage.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, PermissionsModule, AuthModule],
  providers: [CartDesignService],
  controllers: [CartDesignController],
  exports: [CartDesignService],
})
export class CartDesignModule {}
