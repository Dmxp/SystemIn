import { Injectable } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications/notifications.gateway';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(currentUser: { userId: number; role: string }) {
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

    const include = {
      creator: {
        select: { id: true, fullName: true, email: true },
      },
      assignee: {
        select: { id: true, fullName: true, email: true },
      },
      department: {
        select: { id: true, name: true },
      },
    };

    if (user.role === 'ADMIN' || user.role === 'MANAGEMENT') {
      return this.prisma.task.findMany({
        include,
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'DEPARTMENT_HEAD') {
      return this.prisma.task.findMany({
        where: {
          departmentId: user.departmentId,
        },
        include,
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.task.findMany({
      where: {
        OR: [{ creatorId: user.id }, { assigneeId: user.id }],
      },
      include,
      orderBy: { createdAt: 'desc' },
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
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || TaskPriority.MEDIUM,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        creatorId,
        assigneeId: data.assigneeId,
        departmentId: data.departmentId,
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
    });

    if (task.assigneeId) {
      this.notificationsGateway.sendToUser(task.assigneeId, {
        id: Date.now(),
        title: 'Новая задача',
        text: `Вам назначена задача: ${task.title}`,
        type: 'TASK_ASSIGNED',
        createdAt: new Date().toISOString(),
      });
    }

    return task;
  }

  async updateStatus(id: number, status: TaskStatus) {
    const task = await this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true },
        },
        assignee: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (task.creatorId && task.creatorId !== task.assigneeId) {
      this.notificationsGateway.sendToUser(task.creatorId, {
        id: Date.now(),
        title: 'Статус задачи изменён',
        text: `Задача "${task.title}" теперь имеет статус ${task.status}`,
        type: 'TASK_STATUS_CHANGED',
        createdAt: new Date().toISOString(),
      });
    }

    return task;
  }
}