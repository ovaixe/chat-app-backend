import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';

@Injectable()
export class ChatsService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async createMessage(chat: Chat): Promise<Chat> {
    const createdMessage = new this.chatModel(chat);
    return createdMessage.save();
  }

  async getMessages(): Promise<Chat[]> {
    return await this.chatModel.find().exec();
  }

  async clearChats(): Promise<object> {
    try {
      const resp = await this.chatModel.deleteMany({});
      return resp;
    } catch (err) {
      throw err;
    }
  }

  getHello(): string {
    return 'Hello From Chat App!';
  }
}
