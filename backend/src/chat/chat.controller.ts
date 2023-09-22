import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation/:chatId')
  async getConversation(@Param('chatId') chatId: string) {
    return await this.chatService.getConversation(Number(chatId));
  }

  //  @Get(':chatId')
  //  async getChatById(@Param('chatId') chatId: string) {
  //    const chat = await this.chatService.getChatById(Number(chatId));
  //    return chat;
  //  }

  @Get('chatId')
  async getChatId(
    @GetUser('id') id,
    @Query('ids') membersId: string | string[],
  ) {
    if (!Array.isArray(membersId)) {
      membersId = [membersId];
    }
    membersId.push(id);
    const chatId = await this.chatService.getChatId(membersId);
    //if (chatId.length === 0) {
    //  return { chatId: -1 };
    //}
    //return { chatId: chatId[0] };
    return chatId[0];
  }

  @Get('allUserChats')
  async getAllUserChats(@GetUser() user) {
    const chats = await this.chatService.getAllUserChats(user.username);
    return chats;
  }

  @Get('publicChats')
  async getPublicChats(
    @Query('start') start: string,
    @Query('limit') limit: string,
  ) {
    const { chats, totalChatsCount } = await this.chatService.getChatsPublic(
      Number(start),
      Number(limit),
    );
    return { chats, totalChatsCount };
  }

  @Post('verifyPassword')
  async verifyPassword(@Body() body: { chatId: string; password: string }) {
    const chat = await this.chatService.getChatById(Number(body.chatId));
    if (chat.accessibility === 'public' || chat.accessibility === 'private')
      return true;
    if (
      chat.accessibility === 'protected' &&
      chat.password &&
      chat.password === body.password
    )
      return true;
    else return false;
  }

  @Post('create-chat')
  async createChat(
    @GetUser('id') id,
    @Body('membersId') membersId: number[],
    @Body('name') name?: string,
    @Body('accessibility') accessibility?: string,
    @Body('password') password?: string,
  ) {
    membersId.push(id);
    const newGroupChat = await this.chatService.createChat(
      membersId,
      name,
      accessibility,
      password,
    );

    return { chatId: newGroupChat };
  }

  @Patch('updateLastMessageRead')
  async updateLastMessageRead(@Body() body): Promise<any> {
    const { chatId, messageId, userId } = body;
    return await this.chatService.updateLastMessageRead(
      chatId,
      messageId,
      userId,
    );
  }
}
