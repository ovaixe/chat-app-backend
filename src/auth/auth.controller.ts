import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    try {
      const user = await this.authService.signIn(
        signInDto.username,
        signInDto.password,
      );
      return { status: 200, isSuccess: true, data: user };
    } catch (err) {
      console.log('[ERROR][AuthController:signIn]: ', err.message);
      return { status: 400, isSuccess: false, error: err.message };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      const user = await this.authService.signUp(
        signUpDto.username,
        signUpDto.password,
      );
      return { status: 200, isSuccess: true, data: user };
    } catch (err) {
      console.log('[ERROR][AuthController:signUp]: ', err.message);
      return { status: 400, isSuccess: false, error: err.message };
    }
  }
}
