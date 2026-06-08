import { Injectable } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: {
    userId: number;
    role: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        role: true,
        departmentId: true,
      },
    });

    if (!user) {
      return [];
    }

    if (user.role === 'ADMIN' || user.role === 'MANAGEMENT') {
      return this.prisma.task.findMany({
        include: {
          creator: {
            select: { id: true, fullName: true, email: true },
          },
          assignee: {
            select: { id: true, fullName: true, email: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (user.role === 'DEPARTMENT_HEAD') {
      return this.prisma.task.findMany({
        where: {
          departmentId: user.departmentId,
        },
        include: {
          creator: {
            select: { id: true, fullName: true, email: true },
          },
          assignee: {
            select: { id: true, fullName: true, email: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return this.prisma.task.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          { assigneeId: user.id },
        ],
      },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true },
        },
        assignee: {
          select: { id: true, fullName: true, email: true },
        },
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    creatorId: number,
    data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      deadline?: string;
      assigneeId?: number;
      departmentId?: number;
    },
  ) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || TaskPriority.MEDIUM,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        creatorId,
        assigneeId: data.assigneeId,
        departmentId: data.departmentId,
      },
    });
  }

  async updateStatus(id: number, status: TaskStatus) {
    return this.prisma.task.update({
      where: { id },
      data: { status },
    });
  }
}