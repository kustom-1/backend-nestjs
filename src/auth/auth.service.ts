import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';
import { PasswordService } from '../common/password.service';
import { UnauthorizedException, NotFoundException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class AuthService {
  
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {}

  async signIn(email: string, password: string): Promise<{ access_token: string; user: { firstName: string; lastName: string; role: string; email: string } }> {
    const user: User = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('Usuario');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador');
    }
    
    if (!(await this.passwordService.comparePasswords(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas. Verifique su email y contraseña');
    }
    
    const payload = { sub: user.id, email: user.email, role: user.role }; 
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.passwordService.comparePasswords(password, user.password))) {
      return user;
    }
    return null;
  }
}
