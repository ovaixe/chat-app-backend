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
import { Chat } from './schemas/chat.schema';

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

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody() payload: Chat,
  ): Promise<void> {
    await this.chatsService.createMessage(payload);
    console.log('newMsg: ', payload);
    this.server.emit('newIncomingMessage', payload);
  }

  afterInit(server: Server) {
    console.log('[LOG]:[ChatsGateway:afterInit]: ', server);
  }

  handleConnection(client: Socket) {
    console.log(`[LOG][ChatsGateway:handleConnection]: Connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(
      `[LOG][ChatsGateway:handleDisconnect]: Disconnected ${client.id}`,
    );
  }
}
