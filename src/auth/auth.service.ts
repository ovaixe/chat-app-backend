import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { User } from 'src/users/schemas/user.schema';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private logger = new Logger('AuthService');

  async signIn(username: string, password: string): Promise<object> {
    try {
      const user = await this.usersService.findOne(username);
      if (
        user &&
        (await this.usersService.comparePasswords(password, user.password))
      ) {
        const payload = { username: user.userName, sub: user.password };
        const access_token = await this.jwtService.signAsync(payload);
        return { userName: user.userName, access_token };
      } else throw new UnauthorizedException('Invalid password');
    } catch (err) {
      this.logger.log('[ERROR][AuthService:signIn]: ' + err.message);
      throw err;
    }
  }

  async signUp(username: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.createOne(username, password);
      return user;
    } catch (err) {
      this.logger.log('[ERROR][AuthService:signUp]: ' + err.message);
      throw err;
    }
  }

  async varify(token: string): Promise<User> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
