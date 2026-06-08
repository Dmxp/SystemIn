import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ConversationType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getMyConversations(@Req() req: any) {
    return this.chatsService.getMyConversations(req.user.userId);
  }

  @Post()
  createConversation(
    @Req() req: any,
    @Body()
    body: {
      title?: string;
      type?: ConversationType;
      memberIds: number[];
    },
  ) {
    return this.chatsService.createConversation(
      req.user.userId,
      body,
    );
  }

  @Get(':id/messages')
  getMessages(@Req() req: any, @Param('id') id: string) {
    return this.chatsService.getMessages(
      req.user.userId,
      Number(id),
    );
  }

  @Post(':id/messages')
  sendMessage(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      text: string;
    },
  ) {
    return this.chatsService.sendMessage(
      req.user.userId,
      Number(id),
      body.text,
    );
  }
}