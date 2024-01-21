import { Controller, Get, Param, UseGuards, Logger } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Room } from '../interfaces/chat.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  private logger = new Logger('ChatsController');

  @UseGuards(AuthGuard)
  @Get('/all-chats')
  async AllChats() {
    try {
      const messages = await this.chatsService.getMessages();
      return { data: messages, isSuccess: true, status: 200 };
    } catch (err) {
      this.logger.error(`[AllChats]: ` + err.message);
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
      this.logger.error(`[ClearChats]: ` + err.message);
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
      this.logger.error('[AllRooms]: ' + err.message);
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
      this.logger.error('[getRoom]: ' + err.message);
      return { status: 400, isSucces: false, error: err };
    }
  }
}
