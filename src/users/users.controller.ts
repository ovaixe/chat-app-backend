import { Controller } from '@nestjs/common';
import { ChatsService } from '../chats/chats.service';

@Controller('api')
export class UsersController {
  constructor(private chatsService: ChatsService) {}
}
