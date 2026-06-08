import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { DepartmentsService } from './departments.service';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
    },
  ) {
    return this.departmentsService.create(body.name);
  }
}