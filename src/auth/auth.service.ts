import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    try {
      const user = await this.usersService.findOne(username);
      if (
        user &&
        (await this.usersService.comparePasswords(password, user.password))
      ) {
        const payload = { username: user.userName, sub: user.password };
        const access_token = await this.jwtService.signAsync(payload);
        return { userName: user.userName, access_token };
      } else throw new UnauthorizedException();
    } catch (err) {
      console.log('[ERROR][AuthService:signIn]: ', err);
      throw err;
    }
  }

  async signUp(username: string, password: string) {
    try {
      const user = await this.usersService.createOne(username, password);
      return user;
    } catch (err) {
      console.log('[ERROR][AuthService:signUp]: ', err);
      throw err;
    }
  }
}
