import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
  Max,
} from "class-validator"
import { Type, Transform } from "class-transformer"

/**
 * Simple DTO for basic validation tests
 */
export class UserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string

  @IsEmail()
  email: string

  @IsNumber()
  @Min(0)
  @Max(120)
  age: number

  @IsOptional()
  @IsString()
  bio?: string
}

/**
 * DTO with nested validation
 */
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsString()
  @MinLength(5)
  @MaxLength(10)
  zipCode: string
}

export class UserWithAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  @IsArray()
  additionalAddresses?: AddressDto[]
}

/**
 * DTO with transformations
 */
export class ProductDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number.parseFloat(value))
  price: number

  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true"
    }
    return Boolean(value)
  })
  isActive: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

/**
 * DTO for async validation testing
 */
export class AsyncValidationDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsEmail()
  email: string
}
