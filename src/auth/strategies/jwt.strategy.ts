import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from '../auth.module';
import { UsersService } from 'src/users/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { id: number; role: string }) {
    const user = await this.usersService.findOne(payload.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== payload.role) {
      throw new UnauthorizedException('Invalid role');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
