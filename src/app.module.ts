import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuditModule } from './audit/audit.module';
import { LoggerMiddleware } from './common/LoggerMiddleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Conexión a MongoDB para auditoría
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sgd-vivienda-audit',
      {
        // Opciones de conexión
        retryWrites: true,
        w: 'majority',
      },
    ),
    StorageModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
    AuditModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
