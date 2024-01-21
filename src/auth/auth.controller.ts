import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { Logger } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { LoggedInUser } from 'src/interfaces/user.interface';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private logger = new Logger('AuthController');

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    try {
      const user: LoggedInUser = await this.authService.signIn(
        signInDto.username,
        signInDto.password,
      );
      this.logger.log(`[signIn]: user <${user.userName}> signed in`);
      return { status: 200, isSuccess: true, data: user };
    } catch (err) {
      this.logger.error('[signIn]: ' + err.message);
      return { status: 400, isSuccess: false, error: err.message };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      const user: User = await this.authService.signUp(
        signUpDto.username,
        signUpDto.password,
      );
      this.logger.log(`[signUp]: New user <${user.userName}> signed up`);
      return { status: 200, isSuccess: true, data: user };
    } catch (err) {
      this.logger.error('[signUp]: ' + err.message);
      return { status: 400, isSuccess: false, error: err.message };
    }
  }
}
