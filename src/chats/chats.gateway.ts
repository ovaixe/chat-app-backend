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
import { AuthService } from 'src/auth/auth.service';
import { UserInterface } from 'src/interfaces/user.interface';
import { Message } from 'src/interfaces/chat.interface';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './wsAuth.guard';

@WebSocketGateway(8080, {
  cors: {
    origin: '*',
  },
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private chatsService: ChatsService,
    private authService: AuthService,
  ) {}

  @WebSocketServer() server: Server;

  private logger = new Logger('ChatsGateWay');

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody() payload: Message,
  ): Promise<boolean> {
    try {
      await this.chatsService.createMessage(payload);
      this.logger.log('newMsg: ', payload);
      this.server.to(payload.roomName).emit('newIncomingMessage', payload);
      return true;
    } catch (err) {
      this.logger.error('[handleMessage]: ', err.message);
      return false;
    }
  }

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
          this.logger.log(
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
      this.logger.error('[handleJoinRoom]: ', err.message);
      return false;
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() payload: { roomName: string; user: UserInterface },
  ): Promise<boolean> {
    try {
      if (payload.user.socketId) {
        this.logger.log(
          `${payload.user.socketId} is leaving ${payload.roomName}`,
        );

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
      this.logger.error('[handleLeaveRoom]: ', err.message);
      return false;
    }
  }

  @SubscribeMessage('getRooms')
  async getAllRooms(): Promise<boolean> {
    try {
      const rooms = await this.chatsService.getRooms();
      this.server.emit('allRooms', rooms);
      return true;
    } catch (err) {
      this.logger.error('[getAllRooms]: ', err.message);
      throw err;
    }
  }

  afterInit(server: Server) {
    this.logger.log('[afterInit]: ', server);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`[handleConnection]: Socket Connected ${client.id}`);
    try {
      const [type, token] =
        client.handshake.headers.authorization?.split(' ') ?? [];
      if (type !== 'Bearer') throw new Error('Unauthorized: Bad Token');
      const user = await this.authService.varify(token);
      if (!user) throw new Error('Unauthorized: User not found');
    } catch (err) {
      this.logger.log(`[handleConnection]: ${err.message}, Disconnecting...`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // this.chatsService.removeUserFromAllRooms()
    this.logger.log(`[handleDisconnect]: Socket Disconnected ${client.id}`);
  }
}
