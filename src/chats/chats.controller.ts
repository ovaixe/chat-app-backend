import { Controller, Get } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('api')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('hello')
  Hello(): string {
    return this.chatsService.getHello();
  }

  @Get('/chat')
  async Chat() {
    try {
      const messages = await this.chatsService.getMessages();
      return { data: messages, isSuccess: true, status: 200 };
    } catch (err) {
      console.log(`[ERROR][ChatsController:Chat]: `, err);
      return { error: err, isSuccess: false, status: 400 };
    }
  }
}
