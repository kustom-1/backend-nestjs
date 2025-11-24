import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeederService } from './database-seeder.service';
import { DatabaseSeederResolver } from './database-seeder.resolver';
import { User } from '../users/users.entity';
import { Category } from '../categories/category.entity';
import { Cloth } from '../cloths/cloth.entity';
import { RolePermission } from '../permissions/role-permission.entity';
import { UserRoleMapping } from '../permissions/user-role.entity';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Category,
      Cloth,
      RolePermission,
      UserRoleMapping,
    ]),
    PermissionsModule,
  ],
  providers: [DatabaseSeederService, DatabaseSeederResolver],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}
