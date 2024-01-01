import { IsString, MaxLength } from 'class-validator';

export class SignInDto {
  @IsString()
  username: string;

  @MaxLength(50)
  password: string;
}
