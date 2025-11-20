/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { UserEntity } from '../entities/user.entity';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.prisma.user.create({
      data: registerDto,
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${loginDto.email}`);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    return {
      user,
      ...tokens,
    };
  }

  async generateTokens(userId: number, role: string) {
    const payload = { id: userId, role };
    const accessToken = await this.jwtService.signAsync({
      ...payload,
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync({
      ...payload,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refresh(token: string) {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken: token },
    });

    if (!session) throw new UnauthorizedException('Invalid refresh token');

    const newTokens = await this.generateTokens(session.userId, 'STUDENT');

    return newTokens;
  }
}
