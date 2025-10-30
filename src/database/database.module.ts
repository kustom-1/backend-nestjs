import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeederService } from './database-seeder.service';
import { User } from '../users/users.entity';
import { Category } from '../categories/category.entity';
import { Cloth } from '../cloths/cloth.entity';
import { Image } from '../images/image.entity';
import { Design } from '../designs/design.entity';
import { Cart } from '../carts/cart.entity';
import { Address } from '../addresses/address.entity';
import { CartDesign } from '../cart-design/cart-design.entity';
import { CustomImage } from '../custom-images/custom-image.entity';
import { DesignHistory } from '../design-history/design-history.entity';
import { Stock } from '../stocks/stock.entity';
import { Order } from '../orders/order.entity';
import { Transaction } from '../transactions/transaction.entity';
import { RolePermission } from '../permissions/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Category,
      Cloth,
      Image,
      Design,
      Cart,
      Address,
      CartDesign,
      CustomImage,
      DesignHistory,
      Stock,
      Order,
      Transaction,
      RolePermission,
    ]),
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}
