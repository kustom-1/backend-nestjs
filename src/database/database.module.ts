import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeederService } from './database-seeder.service';
import { User } from '../users/users.entity';
import { Category } from '../categories/category.entity';
import { Cloth } from '../cloths/cloth.entity';
import { RolePermission } from '../permissions/role-permission.entity';
import { UserRoleMapping } from '../permissions/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Category,
      Cloth,
      RolePermission,
      UserRoleMapping,
    ]),
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}
