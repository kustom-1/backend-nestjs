import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_jwt_secret', 
    });
  }

  async validate(payload: any) {
    // Log payload to help debug authentication issues (e.g. missing token on some requests)
    try {
      console.log('JwtStrategy.validate payload:', payload);
    } catch (err) {
      console.error('Error logging JWT payload:', err);
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}