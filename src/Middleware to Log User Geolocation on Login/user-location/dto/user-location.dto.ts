import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateUserLocationDto {
  @IsString()
  userId: string;

  @IsString()
  ipAddress: string;

  @IsString()
  country: string;

  @IsString()
  countryCode: string;

  @IsString()
  region: string;

  @IsString()
  regionName: string;

  @IsString()
  city: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  isp?: string;
}