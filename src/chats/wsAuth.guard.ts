import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      client['user'] = payload;
    } catch {
      throw new WsException('Unauthorized');
    }

    return true;
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const token = client.handshake.headers.authorization;
    return token ? token : undefined;
  }
}
