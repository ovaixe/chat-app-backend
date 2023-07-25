import { Controller, Get } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('api/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('hello')
  Hello(): string {
    return this.chatsService.getHello();
  }

  @Get('/all-chats')
  async Chat() {
    try {
      const messages = await this.chatsService.getMessages();
      return { data: messages, isSuccess: true, status: 200 };
    } catch (err) {
      console.log(`[ERROR][ChatsController:Chat]: `, err);
      return { error: err, isSuccess: false, status: 400 };
    }
  }

  @Get('/clear-chats')
  async ClearChats() {
    try {
      const resp = await this.chatsService.clearChats();
      return { data: resp, isSuccess: true, status: 200 };
    } catch (err) {
      console.log(`[ERROR][ChatsController:ClearChats]: `, err);
      return { error: err, isSuccess: false, status: 400 };
    }
  }
}
