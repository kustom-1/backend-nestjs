import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '../common/password.service';
import { JwtStrategy } from './auth.jwtstrategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: 'your_jwt_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, PasswordService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule, JwtStrategy], 
})
export class AuthModule {}
