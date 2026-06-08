import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ScheduleEventType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Post()
  create(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      description?: string;
      date: string;
      startTime: string;
      endTime?: string;
      type?: ScheduleEventType;
      location?: string;
      equipment?: string;
      channel?: string;
      responsible?: string;
    },
  ) {
    return this.scheduleService.create(req.user.userId, body);
  }
}