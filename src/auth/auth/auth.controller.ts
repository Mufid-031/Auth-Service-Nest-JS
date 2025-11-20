import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthEntity } from '../entities/auth.entity';
import { LoginDto } from '../dto/login.dto';
import { UserEntity } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { TokenDto } from '../dto/token.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ type: UserEntity })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiResponse({ type: AuthEntity })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body() { refreshToken }: TokenDto) {
    return this.authService.refresh(refreshToken);
  }

  @Post('verify-token')
  verify(@Body() body: { token: string }) {
    return this.authService.verifyToken(body.token);
  }
}
