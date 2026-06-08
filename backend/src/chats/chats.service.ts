import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConversationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsGateway } from './chats/chats.gateway';

@Injectable()
export class ChatsService {
  constructor(
    private prisma: PrismaService,
    private chatsGateway: ChatsGateway,
  ) {}

  async getMyConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                position: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async createConversation(
    creatorId: number,
    data: {
      title?: string;
      type?: ConversationType;
      memberIds: number[];
    },
  ) {
    const uniqueMemberIds = Array.from(
      new Set([creatorId, ...data.memberIds]),
    );
    const conversation = await this.prisma.conversation.create({
      data: {
        title: data.title,
        type: data.type || ConversationType.DIRECT,
        members: {
          create: uniqueMemberIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                position: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    this.chatsGateway.sendNewConversationToUsers(
      uniqueMemberIds,
      conversation,
    );

    return conversation;
  }

  async getMessages(userId: number, conversationId: number) {
    await this.checkAccess(userId, conversationId);

    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async sendMessage(
    userId: number,
    conversationId: number,
    text: string,
  ) {
    await this.checkAccess(userId, conversationId);

    const message = await this.prisma.message.create({
      data: {
        text,
        senderId: userId,
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    this.chatsGateway.sendMessageToChat(conversationId, message);

    await this.prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  }

  private async checkAccess(userId: number, conversationId: number) {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Нет доступа к этому чату');
    }
  }
}