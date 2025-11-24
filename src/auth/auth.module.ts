import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
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
  providers: [AuthService, PasswordService, JwtStrategy, AuthResolver],
  exports: [JwtModule, JwtStrategy, AuthService],
})
export class AuthModule {}
