import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Room } from '../interfaces/chat.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(AuthGuard)
  @Get('hello')
  Hello(): string {
    return this.chatsService.getHello();
  }

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Get('all-rooms')
  async AllRooms() {
    try {
      const rooms = await this.chatsService.getRooms();
      return { status: 200, isSuccess: true, data: rooms };
    } catch (err) {
      console.log('[ERROR][ChatsController:AllRooms]: ', err);
      return { status: 400, isSuccess: false, error: err };
    }
  }

  @UseGuards(AuthGuard)
  @Get('rooms/:room')
  async getRoom(@Param() params: { room: string }): Promise<Room | object> {
    try {
      const rooms = await this.chatsService.getRooms();
      const room = await this.chatsService.getRoomByName(params.room);
      return { status: 200, isSuccess: true, data: rooms[room] };
    } catch (err) {
      console.log('[ERROR][ChatsController:getRoom]: ', err);
      return { status: 400, isSucces: false, error: err };
    }
  }
}
