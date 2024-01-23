import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { Room } from '../interfaces/chat.interface';
import { UserInterface } from '../interfaces/user.interface';

@Injectable()
export class ChatsService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  private rooms: Room[] = [];
  private logger = new Logger('ChatsService');

  async createMessage(chat: Chat): Promise<Chat> {
    try {
      const createdMessage = new this.chatModel(chat);
      return createdMessage.save();
    } catch (err) {
      this.logger.error('[createMessage]: ' + err.message);
      throw err;
    }
  }

  async getMessages(): Promise<Chat[]> {
    try {
      return await this.chatModel.find().exec();
    } catch (err) {
      this.logger.error('[getMessages]: ' + err.message);
      throw err;
    }
  }

  async clearChats(): Promise<object> {
    try {
      const resp = await this.chatModel.deleteMany({});
      return resp;
    } catch (err) {
      this.logger.error('[clearChats]: ' + err.message);
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
      this.logger.error('[addRoom]: ' + err.message);
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
      this.logger.error('[removeRoom]: ' + err.message);
      throw err;
    }
  }

  async getRoomHost(roomName: string): Promise<UserInterface> {
    try {
      const roomIndex = await this.getRoomByName(roomName);
      if (roomIndex !== -1) return this.rooms[roomIndex].host;
      throw new Error('Room does not exist!');
    } catch (err) {
      this.logger.error('[getRoomHost]: ' + err.message);
      throw err;
    }
  }

  async getRoomByName(roomName: string): Promise<number> {
    try {
      const roomIndex = this.rooms.findIndex((room) => room?.name === roomName);
      return roomIndex;
    } catch (err) {
      this.logger.error('[getRoomByName]: ' + err.message);
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
      this.logger.error('[addUserToRoom]: ' + err.message);
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
      this.logger.error('[findRoomsByUserSocketId]: ' + err.message);
      throw err;
    }
  }

  async removeUserFromAllRooms(socketId: string): Promise<void> {
    try {
      const rooms = await this.findRoomsByUserSocketId(socketId);
      for (const room of rooms) {
        await this.removeUserFromRoom(room.name, socketId);
      }
    } catch (err) {
      this.logger.error('[removeUserFromAllRooms]: ' + err.message);
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
      } else if (this.rooms[roomIndex].host.socketId === socketId) {
        this.rooms[roomIndex].host = this.rooms[roomIndex].users[0];
      }
      return true;
    } catch (err) {
      this.logger.error('[removeUserFromRoom]: ' + err.message);
      throw err;
    }
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }

  async isUserJoined(roomName: string, user: UserInterface): Promise<boolean> {
    try {
      const roomIndex = await this.getRoomByName(roomName);
      if (roomIndex === -1) return false;
      const isJoined = this.rooms[roomIndex].users.find(
        (u) => u.socketId === user.socketId,
      );
      if (!isJoined) return false;
      return true;
    } catch (err) {
      err.scope = err.scope ? err.scope : 'isUserJoined';
      this.logger.error('[isUserJoined]: ' + err.message);
      throw err;
    }
  }
}
