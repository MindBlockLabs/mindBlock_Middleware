import type { ValidatorOptions as ClassValidatorOptions } from "class-validator"

/**
 * Extended validator options interface
 */
export interface ValidatorOptions extends ClassValidatorOptions {
  /**
   * Enable automatic type transformation
   * @default true
   */
  transform?: boolean
}

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  isValid: boolean
  data?: T
  errors?: Array<{ field: string; errors: string[] }>
}
