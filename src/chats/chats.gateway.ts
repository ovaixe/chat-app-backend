import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { AuthService } from 'src/auth/auth.service';
import { UserInterface } from 'src/interfaces/user.interface';
import { Message, DirectMessage } from 'src/interfaces/chat.interface';
import { Logger } from '@nestjs/common';

@WebSocketGateway(8080, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
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
      this.logger.log('newMsg: ' + JSON.stringify(payload));
      await this.chatsService.createMessage(payload);
      this.server.to(payload.roomName).emit('newIncomingMessage', payload);
      return true;
    } catch (err) {
      this.logger.error('[handleMessage]: ' + err.message);
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
      this.logger.error('[handleJoinRoom]: ' + err.message);
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

        const hostUser = await this.chatsService.getRoomHost(payload.roomName);

        this.server.in(payload.user.socketId).socketsLeave(payload.roomName);
        await this.chatsService.removeUserFromRoom(
          payload.roomName,
          payload.user.socketId,
        );

        this.server.to(payload.roomName).emit('newIncomingMessage', {
          userName: 'Server',
          timeSent: new Date(),
          message: `${payload.user.userName} left the room`,
          roomName: payload.roomName,
        });

        if (hostUser.userName === payload.user.userName) {
          const newHost = await this.chatsService.getRoomHost(payload.roomName);

          this.server.to(payload.roomName).emit('newIncomingMessage', {
            userName: 'Server',
            timeSent: new Date(),
            message: `${newHost.userName} is host now`,
            roomName: payload.roomName,
          });

          await this.getRoomHost({ roomName: payload.roomName });
        }

        await this.getAllRooms();
        return true;
      } else return false;
    } catch (err) {
      this.logger.error('[handleLeaveRoom]: ' + err.message);
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
      this.logger.error('[getAllRooms]: ' + err.message);

      return false;
    }
  }

  @SubscribeMessage('getRoomHost')
  async getRoomHost(
    @MessageBody() payload: { roomName: string },
  ): Promise<boolean> {
    try {
      const host = await this.chatsService.getRoomHost(payload.roomName);
      this.server.to(payload.roomName).emit('roomHost', host);
      return true;
    } catch (err) {
      this.logger.error('[getRoomHost]: ' + err.message);
      return false;
    }
  }

  @SubscribeMessage('activeUsers')
  async getActiveUsers(): Promise<boolean> {
    const activeUsers = [];
    for (const [id, socket] of this.server.of('/').sockets) {
      activeUsers.push({
        socketId: id,
        userName: socket['userName'],
        messages: [],
        hasNewMessages: false,
      });
    }
    this.server.emit('activeUsers', activeUsers);
    return true;
  }

  @SubscribeMessage('direct-message')
  async handleDirectMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody() payload: { message: DirectMessage; to: string },
  ): Promise<boolean> {
    console.log('direct-message >>>', payload.message);
    this.server
      .to(payload.to)
      .emit('direct-message', { message: payload.message, from: client.id });
    return true;
  }

  afterInit(server: Server) {
    this.logger.log('[afterInit]: ', server);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`[handleConnection]: Socket Connected <${client.id}>`);
    try {
      const userName = await this.varifyUser(client);
      client['userName'] = userName;

      await this.getActiveUsers();
    } catch (err) {
      this.logger.log(`[handleConnection]: ${err.message}, Disconnecting...`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      await this.chatsService.removeUserFromAllRooms(client.id);

      await this.getAllRooms();

      await this.getActiveUsers();

      this.logger.log(`[handleDisconnect]: Socket Disconnected <${client.id}>`);
    } catch (err: any) {
      this.logger.error('[handleDisconnect]: ' + err.message);
    }
  }

  private async varifyUser(client: Socket) {
    const token = this.extractTokenFromHeader(client);
    if (!token) {
      throw new WsException('Unauthorized');
    }
    const user = await this.authService.varify(token);
    if (!user) throw new WsException('Unauthorized: User not found');
    return this.extractUserFromHeader(client);
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractUserFromHeader(client: Socket): string | undefined {
    const user: string = client.handshake.headers.user as string;
    return user;
  }
}
