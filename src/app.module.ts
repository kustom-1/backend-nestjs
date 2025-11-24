import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ClothsModule } from './cloths/cloths.module';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { LoggerMiddleware } from './common/LoggerMiddleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Configuración de GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
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
      ssl: process.env.DB_SSLMODE === 'require' ? { rejectUnauthorized: false } : false,
    }),
    DatabaseModule,
    StorageModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
    ClothsModule,
    CategoriesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
