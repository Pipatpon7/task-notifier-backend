import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './task/task.module';
import { NotificationModule } from './notification/notification.module';
import { LineController } from './line/line.controller';
import { LineModule } from './line/line.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TaskModule,
    NotificationModule,
    LineModule,
  ],
  controllers: [LineController],
})
export class AppModule {}
