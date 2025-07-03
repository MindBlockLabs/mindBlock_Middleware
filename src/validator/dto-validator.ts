import { validate, validateSync, type ValidationError as ClassValidationError } from "class-validator"
import { plainToClass, type ClassConstructor } from "class-transformer"
import { ValidationError } from "./errors/validation.error"
import type { ValidatorOptions } from "./types/validator.types"

/**
 * Universal DTO Validator
 * Validates any DTO class using class-validator without needing NestJS decorators or pipes
 */
export class DtoValidator {
  /**
   * Validates a DTO asynchronously
   * @param dtoClass - The DTO class constructor
   * @param plainObject - Plain object to validate
   * @param options - Validation options
   * @returns Promise of validated DTO instance
   * @throws ValidationError if validation fails
   */
  static async validateDto<T extends object>(
    dtoClass: ClassConstructor<T>,
    plainObject: any,
    options: ValidatorOptions = {},
  ): Promise<T> {
    const {
      skipMissingProperties = false,
      whitelist = true,
      forbidNonWhitelisted = true,
      transform = true,
      ...validatorOptions
    } = options

    try {
      // Transform plain object to class instance
      const dtoInstance = plainToClass(dtoClass, plainObject, {
        enableImplicitConversion: transform,
        excludeExtraneousValues: whitelist,
      })

      // Validate the instance
      const errors = await validate(dtoInstance, {
        skipMissingProperties,
        whitelist,
        forbidNonWhitelisted,
        ...validatorOptions,
      })

      if (errors.length > 0) {
        throw new ValidationError("DTO validation failed", this.formatValidationErrors(errors), dtoClass.name)
      }

      return dtoInstance
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      throw new ValidationError(
        "Unexpected validation error",
        [{ field: "unknown", errors: [error.message || "Unknown error"] }],
        dtoClass.name,
      )
    }
  }

  /**
   * Validates a DTO synchronously
   * @param dtoClass - The DTO class constructor
   * @param plainObject - Plain object to validate
   * @param options - Validation options
   * @returns Validated DTO instance
   * @throws ValidationError if validation fails
   */
  static validateDtoSync<T extends object>(
    dtoClass: ClassConstructor<T>,
    plainObject: any,
    options: ValidatorOptions = {},
  ): T {
    const {
      skipMissingProperties = false,
      whitelist = true,
      forbidNonWhitelisted = true,
      transform = true,
      ...validatorOptions
    } = options

    try {
      // Transform plain object to class instance
      const dtoInstance = plainToClass(dtoClass, plainObject, {
        enableImplicitConversion: transform,
        excludeExtraneousValues: whitelist,
      })

      // Validate the instance synchronously
      const errors = validateSync(dtoInstance, {
        skipMissingProperties,
        whitelist,
        forbidNonWhitelisted,
        ...validatorOptions,
      })

      if (errors.length > 0) {
        throw new ValidationError("DTO validation failed", this.formatValidationErrors(errors), dtoClass.name)
      }

      return dtoInstance
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      throw new ValidationError(
        "Unexpected validation error",
        [{ field: "unknown", errors: [error.message || "Unknown error"] }],
        dtoClass.name,
      )
    }
  }

  /**
   * Formats class-validator errors into a structured format
   */
  private static formatValidationErrors(errors: ClassValidationError[]) {
    const formattedErrors: Array<{ field: string; errors: string[] }> = []

    const processError = (error: ClassValidationError, parentPath = "") => {
      const fieldPath = parentPath ? `${parentPath}.${error.property}` : error.property

      if (error.constraints) {
        formattedErrors.push({
          field: fieldPath,
          errors: Object.values(error.constraints),
        })
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        error.children.forEach((childError) => {
          processError(childError, fieldPath)
        })
      }
    }

    errors.forEach((error) => processError(error))
    return formattedErrors
  }
}

// Export convenience functions
export const validateDto = DtoValidator.validateDto.bind(DtoValidator)
export const validateDtoSync = DtoValidator.validateDtoSync.bind(DtoValidator)
