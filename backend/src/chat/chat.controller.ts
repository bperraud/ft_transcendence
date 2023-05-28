import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtGuard)
  @Post('add-message')
  async sendMessage(
    @GetUser() user,
    @Body('recipientUsername') recipientUsername: string,
    @Body('content') content: string
  ) {
    await this.chatService.sendMessage(user.username, recipientUsername, content);
    return { message: "Message sent successfully" };
  }

  @UseGuards(JwtGuard)
  @Get('allMessages')
  async getAllMessages(@GetUser() user) {
    const messages = await this.chatService.getAllMessages(user.username);
    return messages;
  }
}
