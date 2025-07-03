// Main exports
export { DtoValidator, validateDto, validateDtoSync } from "./dto-validator"
export { ValidationError } from "./errors/validation.error"
export { ValidatorOptions, ValidationResult } from "./types/validator.types"

// Re-export commonly used class-validator decorators for convenience
export {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  Type,
  IsBoolean,
  IsDate,
  IsEnum,
  Min,
  Max,
} from "class-validator"

export { Transform, Expose, Exclude } from "class-transformer"
