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

  async updateMe(
  userId: number,
  data: {
    fullName?: string;
    email?: string;
    position?: string;
    cabinet?: string;
  },
) {
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      email: data.email,
      position: data.position,
      cabinet: data.cabinet,
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
      createdAt: true,
    },
  });

  return updatedUser;
}

  async changeMyPassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });

    return {
      message: 'Пароль успешно изменён',
    };
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