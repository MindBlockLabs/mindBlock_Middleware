import { IsString } from 'class-validator';

export class Enable2FADto {
  @IsString()
  token: string;
}