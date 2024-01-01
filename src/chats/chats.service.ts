import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { Room } from '../interfaces/chat.interface';
import { UserInterface } from '../interfaces/user.interface';

@Injectable()
export class ChatsService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}
  private rooms: Room[] = [];

  async createMessage(chat: Chat): Promise<Chat> {
    try {
      const createdMessage = new this.chatModel(chat);
      return createdMessage.save();
    } catch (err) {
      console.log('[ERROR][ChatsService:createMessage]: ', err);
      throw err;
    }
  }

  async getMessages(): Promise<Chat[]> {
    try {
      return await this.chatModel.find().exec();
    } catch (err) {
      console.log('[ERROR][ChatsService:getMessages]: ', err);
      throw err;
    }
  }

  async clearChats(): Promise<object> {
    try {
      const resp = await this.chatModel.deleteMany({});
      return resp;
    } catch (err) {
      console.log('[ERROR][ChatsService:clearChats]: ', err);
      throw err;
    }
  }

  async addRoom(roomName: string, host: UserInterface): Promise<boolean> {
    try {
      const room = await this.getRoomByName(roomName);
      if (room === -1) {
        this.rooms.push({ name: roomName, host, users: [host] });
        return true;
      }
      throw new Error('Room with same name already exists!');
    } catch (err) {
      console.log('[Error][ChatsService:addRoom]: ', err);
      throw err;
    }
  }

  async removeRoom(roomName: string): Promise<void> {
    try {
      const findRoom = await this.getRoomByName(roomName);
      if (findRoom !== -1) {
        this.rooms = this.rooms.filter((room) => room.name !== roomName);
      }
    } catch (err) {
      console.log('[Error][ChatsService:removeRoom]: ', err);
      throw err;
    }
  }

  async getRoomHost(hostName: string): Promise<UserInterface> {
    try {
      const roomIndex = await this.getRoomByName(hostName);
      return this.rooms[roomIndex].host;
    } catch (err) {
      console.log('[Error][ChatsService:getRoomHost]: ', err);
      throw err;
    }
  }

  async getRoomByName(roomName: string): Promise<number> {
    try {
      const roomIndex = this.rooms.findIndex((room) => room?.name === roomName);
      return roomIndex;
    } catch (err) {
      console.log('[Error][ChatsService:getRoomByName]: ', err);
      throw err;
    }
  }

  async addUserToRoom(roomName: string, user: UserInterface): Promise<boolean> {
    try {
      const roomIndex = await this.getRoomByName(roomName);
      if (roomIndex !== -1) {
        this.rooms[roomIndex].users.push(user);
        const host = await this.getRoomHost(roomName);
        if (host.userName === user.userName) {
          this.rooms[roomIndex].host.socketId = user.socketId;
        }
        return true;
      } else {
        const resp = await this.addRoom(roomName, user);
        return resp;
      }
    } catch (err) {
      console.log('[Error][ChatsService:addUserToRoom]: ', err);
      throw err;
    }
  }

  async findRoomsByUserSocketId(socketId: string): Promise<Room[]> {
    try {
      const filteredRooms = this.rooms.filter((room) => {
        const found = room.users.find((user) => user.socketId === socketId);
        if (found) {
          return found;
        }
      });
      return filteredRooms;
    } catch (err) {
      console.log('[Error][ChatsService:findRoomsByUserSocketId]: ', err);
      throw err;
    }
  }

  async removeUserFromAllRooms(socketId: string): Promise<void> {
    try {
      const rooms = await this.findRoomsByUserSocketId(socketId);
      for (const room of rooms) {
        await this.removeUserFromRoom(socketId, room.name);
      }
    } catch (err) {
      console.log('[Error][ChatsService:removeUserFromAllRooms]: ', err);
      throw err;
    }
  }

  async removeUserFromRoom(
    roomName: string,
    socketId: string,
  ): Promise<boolean> {
    try {
      const roomIndex = await this.getRoomByName(roomName);
      this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter(
        (user) => user.socketId !== socketId,
      );
      if (this.rooms[roomIndex].users.length === 0) {
        await this.removeRoom(roomName);
      }
      return true;
    } catch (err) {
      console.log('[Error][ChatsService:removeUserFromRoom]: ', err);
      throw err;
    }
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }

  async isUserJoined(roomName: string, user: UserInterface): Promise<boolean> {
    try {
      const roomIndex = await this.getRoomByName(roomName);
      if (roomIndex !== -1) {
        const isJoined = this.rooms[roomIndex].users.find(
          (u) => u.socketId === user.socketId,
        );
        if (isJoined) return true;
        else return false;
      } else return false;
    } catch (err) {
      console.log('[Error][ChatsService:isUserJoined]: ', err);
      throw err;
    }
  }

  getHello(): string {
    return 'Hello From Chat App!';
  }
}
