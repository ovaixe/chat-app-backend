import { IsString, MaxLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  username: string;

  @MaxLength(50)
  password: string;
}
