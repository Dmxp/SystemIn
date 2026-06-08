import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      position?: string;
      cabinet?: string;
      role?: UserRole;
      departmentId?: number | null;
    },
  ) {
    return this.usersService.update(Number(id), body);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body()
    body: {
      fullName: string;
      email: string;
      password: string;
      position?: string;
      cabinet?: string;
      role?: UserRole;
      departmentId?: number | null;
    },
  ) {
    return this.usersService.create(body);
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updatePassword(
    @Param('id') id: string,

    @Body()
    body: {
      password: string;
    },
  ) {
    return this.usersService.updatePassword(
      Number(id),
      body.password,
    );
  }
}