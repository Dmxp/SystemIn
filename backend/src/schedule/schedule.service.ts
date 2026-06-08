import { Injectable } from '@nestjs/common';
import { ScheduleEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.scheduleEvent.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async create(
    createdById: number,
    data: {
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
    return this.prisma.scheduleEvent.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        type: data.type || ScheduleEventType.OTHER,
        location: data.location,
        equipment: data.equipment,
        channel: data.channel,
        responsible: data.responsible,
        createdById,
      },
    });
  }
}