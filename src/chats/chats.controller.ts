import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Logger,
  Res,
  HttpStatus,
  HttpException,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatsService } from './chats.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';

@Controller('api/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  private logger = new Logger('ChatsController');

  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard)
  @Get('/all-chats')
  async AllChats(@Res() res: Response) {
    try {
      const messages = await this.chatsService.getMessages();
      res
        .status(HttpStatus.OK)
        .json({ data: messages, isSuccess: true, status: 200 });
    } catch (err) {
      this.logger.error(`[AllChats]: ` + err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: err.message, isSuccess: false, status: 400 });
    }
  }

  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard)
  @Get('/clear-chats')
  async ClearChats(@Res() res: Response) {
    try {
      const resp = await this.chatsService.clearChats();
      res
        .status(HttpStatus.OK)
        .json({ data: resp, isSuccess: true, status: 200 });
    } catch (err) {
      this.logger.error(`[ClearChats]: ` + err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: err.message, isSuccess: false, status: 400 });
    }
  }

  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard)
  @Get('/all-rooms')
  async AllRooms(@Res() res: Response) {
    try {
      const rooms = await this.chatsService.getRooms();
      res
        .status(HttpStatus.OK)
        .json({ status: 200, isSuccess: true, data: rooms });
    } catch (err) {
      this.logger.error('[AllRooms]: ' + err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: 400, isSuccess: false, error: err.message });
    }
  }

  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard)
  @Get('/rooms/:roomName')
  async getRoom(@Res() res: Response, @Param('roomName') roomName: string) {
    try {
      const rooms = await this.chatsService.getRooms();
      const room = await this.chatsService.getRoomByName(roomName);
      res
        .status(HttpStatus.OK)
        .json({ status: 200, isSuccess: true, data: rooms[room] });
    } catch (err) {
      this.logger.error('[getRoom]: ' + err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: 400, isSucces: false, error: err.message });
    }
  }

  @UseFilters(new HttpExceptionFilter())
  @UseGuards(AuthGuard)
  @Get('/room-host')
  async getRoomHost(@Res() res: Response, @Query('roomName') roomName: string) {
    try {
      const host = await this.chatsService.getRoomHost(roomName);
      res
        .status(HttpStatus.OK)
        .json({ status: 200, isSuccess: true, data: host });
    } catch (err) {
      this.logger.error('[getRoomHost]: ' + err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: 400, isSuccess: false, error: err.message });
    }
  }
}
