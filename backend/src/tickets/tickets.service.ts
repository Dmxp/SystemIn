import { Injectable } from '@nestjs/common';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
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

    if (
      user.role === 'ADMIN' ||
      user.role === 'MANAGEMENT' ||
      user.role === 'PTO_SPECIALIST'
    ) {
      return this.prisma.ticket.findMany({
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
      return this.prisma.ticket.findMany({
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

    return this.prisma.ticket.findMany({
      where: {
        creatorId: user.id,
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
      category?: string;
      priority?: TicketPriority;
      cabinet?: string;
      assigneeId?: number;
      departmentId?: number;
    },
  ) {
    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || TicketPriority.MEDIUM,
        cabinet: data.cabinet,
        creatorId,
        assigneeId: data.assigneeId,
        departmentId: data.departmentId,
      },
    });
  }

  async updateStatus(id: number, status: TicketStatus) {
    return this.prisma.ticket.update({
      where: { id },
      data: { status },
    });
  }

  async assign(id: number, assigneeId: number) {
    return this.prisma.ticket.update({
      where: { id },
      data: { assigneeId },
    });
  }
}