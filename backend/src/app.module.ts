import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentsModule } from './departments/departments.module';
import { TasksModule } from './tasks/tasks.module';
import { TicketsModule } from './tickets/tickets.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ChatsModule } from './chats/chats.module';
import { AiModule } from './ai/ai.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    UsersModule,
    AuthModule,
    DepartmentsModule,
    TasksModule,
    TicketsModule,
    ScheduleModule,
    ChatsModule,
    AiModule,
    NewsModule,
  ],
})
export class AppModule {}