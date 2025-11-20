import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
