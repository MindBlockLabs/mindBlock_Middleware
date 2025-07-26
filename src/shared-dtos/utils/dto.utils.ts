/**
 * DTO utility functions for working with shared DTOs
 */

import { plainToClass, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationResult, ValidationError as CustomValidationError } from '../types/validation.types';

/**
 * Transform and validate a plain object to a DTO class
 */
export async function transformAndValidate<T extends object>(
  dtoClass: ClassConstructor<T>,
  plainObject: any,
  options: {
    skipMissingProperties?: boolean;
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transform?: boolean;
  } = {}
): Promise<ValidationResult<T>> {
  const {
    skipMissingProperties = false,
    whitelist = true,
    forbidNonWhitelisted = true,
    transform = true,
  } = options;

  try {
    // Transform plain object to class instance
    const dtoInstance = plainToClass(dtoClass, plainObject, {
      enableImplicitConversion: transform,
      excludeExtraneousValues: whitelist,
    });

    // Validate the instance
    const errors = await validate(dtoInstance, {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    });

    if (errors.length > 0) {
      const validationErrors = formatValidationErrors(errors);
      return {
        isValid: false,
        errors: validationErrors,
        warnings: [],
      };
    }

    return {
      isValid: true,
      data: dtoInstance,
      errors: [],
      warnings: [],
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          field: 'unknown',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          value: plainObject,
        },
      ],
      warnings: [],
    };
  }
}

/**
 * Format class-validator errors into a structured format
 */
export function formatValidationErrors(errors: ValidationError[]): CustomValidationError[] {
  const formattedErrors: CustomValidationError[] = [];

  const processError = (error: ValidationError, parentPath = '') => {
    const fieldPath = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      formattedErrors.push({
        field: fieldPath,
        message: Object.values(error.constraints)[0],
        value: error.value,
        constraints: Object.values(error.constraints),
      });
    }

    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      error.children.forEach((childError) => {
        processError(childError, fieldPath);
      });
    }
  };

  errors.forEach((error) => processError(error));
  return formattedErrors;
}

/**
 * Create a partial DTO with only the provided fields
 */
export function createPartialDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  partialData: Partial<T>
): T {
  return plainToClass(dtoClass, partialData, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
}

/**
 * Merge multiple DTOs into one
 */
export function mergeDtos<T extends object>(
  dtoClass: ClassConstructor<T>,
  ...dtos: Partial<T>[]
): T {
  const mergedData = dtos.reduce((acc, dto) => ({ ...acc, ...dto }), {});
  return plainToClass(dtoClass, mergedData, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
}

/**
 * Extract specific fields from a DTO
 */
export function extractFields<T extends object, K extends keyof T>(
  dto: T,
  fields: K[]
): Pick<T, K> {
  const extracted: Partial<T> = {};
  fields.forEach((field) => {
    if (dto[field] !== undefined) {
      extracted[field] = dto[field];
    }
  });
  return extracted as Pick<T, K>;
}

/**
 * Omit specific fields from a DTO
 */
export function omitFields<T extends object, K extends keyof T>(
  dto: T,
  fields: K[]
): Omit<T, K> {
  const result = { ...dto };
  fields.forEach((field) => {
    delete result[field];
  });
  return result;
}

/**
 * Deep clone a DTO
 */
export function cloneDto<T extends object>(dto: T): T {
  return JSON.parse(JSON.stringify(dto));
}

/**
 * Check if a DTO has required fields
 */
export function hasRequiredFields<T extends object>(
  dto: Partial<T>,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.every((field) => dto[field] !== undefined && dto[field] !== null);
}

/**
 * Get missing required fields
 */
export function getMissingFields<T extends object>(
  dto: Partial<T>,
  requiredFields: (keyof T)[]
): (keyof T)[] {
  return requiredFields.filter((field) => dto[field] === undefined || dto[field] === null);
}

/**
 * Sanitize DTO by removing undefined and null values
 */
export function sanitizeDto<T extends object>(dto: T): Partial<T> {
  const sanitized: Partial<T> = {};
  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value;
    }
  });
  return sanitized;
}

/**
 * Convert DTO to plain object
 */
export function toPlainObject<T extends object>(dto: T): Record<string, any> {
  return JSON.parse(JSON.stringify(dto));
}

/**
 * Create a DTO with default values
 */
export function createDtoWithDefaults<T extends object>(
  dtoClass: ClassConstructor<T>,
  data: Partial<T>,
  defaults: Partial<T>
): T {
  const mergedData = { ...defaults, ...data };
  return plainToClass(dtoClass, mergedData, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
}

/**
 * Validate DTO fields individually
 */
export async function validateFields<T extends object>(
  dto: T,
  fields: (keyof T)[]
): Promise<ValidationResult<T>> {
  const errors: CustomValidationError[] = [];

  for (const field of fields) {
    const fieldValue = dto[field];
    if (fieldValue !== undefined) {
      try {
        await validate(fieldValue);
      } catch (validationError) {
        if (validationError instanceof ValidationError) {
          errors.push({
            field: field as string,
            message: 'Field validation failed',
            value: fieldValue,
            constraints: ['validation_failed'],
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? dto : undefined,
    errors,
    warnings: [],
  };
}

/**
 * Create a validation schema from a DTO class
 */
export function createValidationSchema<T extends object>(
  dtoClass: ClassConstructor<T>
): Record<string, any> {
  // This is a simplified version - in a real implementation,
  // you would use reflection to extract validation metadata
  return {
    // Placeholder for validation schema
    // This would be populated based on class-validator decorators
  };
} 