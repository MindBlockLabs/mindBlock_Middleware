import { IsString } from 'class-validator';

export class Verify2FADto {
  @IsString()
  token: string;
}