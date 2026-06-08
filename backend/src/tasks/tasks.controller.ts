import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TaskPriority, TaskStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user);
  }

  @Post()
  create(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      deadline?: string;
      assigneeId?: number;
      departmentId?: number;
    },
  ) {
    return this.tasksService.create(req.user.userId, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: TaskStatus;
    },
  ) {
    return this.tasksService.updateStatus(Number(id), body.status);
  }
}