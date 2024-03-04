import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  HttpException,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { Logger } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { LoggedInUser } from 'src/interfaces/user.interface';
import { HttpExceptionFilter } from '../exception-filters/http-exception.filter';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private logger = new Logger('AuthController');

  @UseFilters(new HttpExceptionFilter())
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Res() res: Response, @Body() signInDto: SignInDto) {
    try {
      const user: LoggedInUser = await this.authService.signIn(
        signInDto.username,
        signInDto.password,
      );
      this.logger.log(`[signIn]: user <${user.userName}> signed in`);
      res
        .status(HttpStatus.OK)
        .json({ status: 200, isSuccess: true, data: user });
    } catch (err) {
      this.logger.error('[signIn]: ' + err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: 400, isSuccess: false, error: err.message });
    }
  }

  @UseFilters(new HttpExceptionFilter())
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(@Res() res: Response, @Body() signUpDto: SignUpDto) {
    try {
      const user: User = await this.authService.signUp(
        signUpDto.username,
        signUpDto.password,
      );
      this.logger.log(`[signUp]: New user <${user.userName}> signed up`);
      res
        .status(HttpStatus.OK)
        .json({ status: 200, isSuccess: true, data: user });
    } catch (err) {
      this.logger.error('[signUp]: ' + err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: 400, isSuccess: false, error: err.message });
    }
  }
}
