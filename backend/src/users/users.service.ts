import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        position: true,
        cabinet: true,
        role: true,
        createdAt: true,

        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: {
      fullName?: string;
      position?: string;
      cabinet?: string;
      role?: UserRole;
      departmentId?: number | null;
    },
  ) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        position: true,
        cabinet: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
  async updatePassword(id: number, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        passwordHash,
      },

      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });
  }
  async create(data: {
    fullName: string;
    email: string;
    password: string;
    position?: string;
    cabinet?: string;
    role?: UserRole;
    departmentId?: number | null;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        position: data.position,
        cabinet: data.cabinet,
        role: data.role || UserRole.USER,
        departmentId: data.departmentId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        position: true,
        cabinet: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}