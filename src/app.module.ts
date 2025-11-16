import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ClothsModule } from './cloths/cloths.module';
import { CategoriesModule } from './categories/categories.module';
import { DesignsModule } from './designs/designs.module';
import { ImagesModule } from './images/images.module';
import { CartsModule } from './carts/carts.module';
import { CustomImagesModule } from './custom-images/custom-images.module';
import { CartDesignModule } from './cart-design/cart-design.module';
import { StocksModule } from './stocks/stocks.module';
import { AddressesModule } from './addresses/addresses.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DesignHistoryModule } from './design-history/design-history.module';
import { DatabaseModule } from './database/database.module';
import { LoggerMiddleware } from './common/LoggerMiddleware';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Conexión a PostgreSQL con TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'app_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // SOLO para desarrollo, desactivar en producción
      logging: false,
    }),

    DatabaseModule,
    StorageModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
    ClothsModule,
    CategoriesModule,
    DesignsModule,
    ImagesModule,
    CartsModule,
    CustomImagesModule,
    CartDesignModule,
    StocksModule,
    AddressesModule,
    OrdersModule,
    TransactionsModule,
    DesignHistoryModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
