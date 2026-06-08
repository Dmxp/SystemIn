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

import { TicketPriority, TicketStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.ticketsService.findAll(req.user);
  }

  @Post()
  create(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      description?: string;
      category?: string;
      priority?: TicketPriority;
      cabinet?: string;
      assigneeId?: number;
      departmentId?: number;
    },
  ) {
    return this.ticketsService.create(req.user.userId, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: TicketStatus;
    },
  ) {
    return this.ticketsService.updateStatus(Number(id), body.status);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body()
    body: {
      assigneeId: number;
    },
  ) {
    return this.ticketsService.assign(Number(id), body.assigneeId);
  }
}