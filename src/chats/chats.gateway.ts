import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { UserInterface } from 'src/interfaces/user.interface';
import { Message } from 'src/interfaces/chat.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway(8080, {
  cors: {
    origin: '*',
  },
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatsService: ChatsService) {}

  @WebSocketServer() server: Server;

  @UseGuards(AuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody() payload: Message,
  ): Promise<boolean> {
    try {
      await this.chatsService.createMessage(payload);
      console.log('newMsg: ', payload);
      this.server.to(payload.roomName).emit('newIncomingMessage', payload);
      return true;
    } catch (err) {
      console.log('[ERROR][ChatsGateway:handleMessage]: ', err);
      return false;
    }
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() payload: { roomName: string; user: UserInterface },
  ): Promise<boolean> {
    try {
      if (payload.user.socketId) {
        const isJoined = await this.chatsService.isUserJoined(
          payload.roomName,
          payload.user,
        );
        if (isJoined) return true;
        else {
          console.log(
            `${payload.user.socketId} is joining ${payload.roomName}`,
          );
          this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
          this.server.to(payload.roomName).emit('newIncomingMessage', {
            userName: 'Server',
            timeSent: new Date(),
            message: `${payload.user.userName} joined the room`,
            roomName: payload.roomName,
          });
          await this.chatsService.addUserToRoom(payload.roomName, payload.user);
          await this.getAllRooms();
          return true;
        }
      } else return false;
    } catch (err) {
      console.log('[ERROR][ChatsGateway:handleJoinRoom]: ', err);
      return false;
    }
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() payload: { roomName: string; user: UserInterface },
  ): Promise<boolean> {
    try {
      if (payload.user.socketId) {
        this.server.in(payload.user.socketId).socketsLeave(payload.roomName);
        this.server.to(payload.roomName).emit('newIncomingMessage', {
          userName: 'Server',
          timeSent: new Date(),
          message: `${payload.user.userName} leaved the room`,
          roomName: payload.roomName,
        });
        await this.chatsService.removeUserFromRoom(
          payload.roomName,
          payload.user.socketId,
        );
        await this.getAllRooms();
        return true;
      } else return false;
    } catch (err) {
      console.log('[ERROR][ChatsGateway:handleLeaveRoom]: ', err);
      return false;
    }
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('getRooms')
  async getAllRooms(): Promise<boolean> {
    try {
      const rooms = await this.chatsService.getRooms();
      this.server.emit('allRooms', rooms);
      return true;
    } catch (err) {
      console.log('[ERROR][ChatsGateway:getAllRooms]: ', err);
      throw err;
    }
  }

  afterInit(server: Server) {
    console.log('[LOG]:[ChatsGateway:afterInit]: ', server);
  }

  handleConnection(client: Socket) {
    console.log(
      `[LOG][ChatsGateway:handleConnection]: Socket Connected ${client.id}`,
    );
  }

  handleDisconnect(client: Socket) {
    console.log(
      `[LOG][ChatsGateway:handleDisconnect]: Socket Disconnected ${client.id}`,
    );
  }
}
