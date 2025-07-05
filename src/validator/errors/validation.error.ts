/**
 * Custom validation error class with structured error information
 */
export class ValidationError extends Error {
  public readonly errors: Array<{ field: string; errors: string[] }>
  public readonly dtoClass: string
  public readonly timestamp: Date

  constructor(message: string, errors: Array<{ field: string; errors: string[] }>, dtoClass?: string) {
    super(message)
    this.name = "ValidationError"
    this.errors = errors
    this.dtoClass = dtoClass || "Unknown"
    this.timestamp = new Date()

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  /**
   * Get a formatted error message with all validation errors
   */
  getFormattedMessage(): string {
    const errorMessages = this.errors.map((error) => `${error.field}: ${error.errors.join(", ")}`).join("; ")

    return `${this.message} in ${this.dtoClass}: ${errorMessages}`
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(fieldName: string): string[] {
    const fieldError = this.errors.find((error) => error.field === fieldName)
    return fieldError ? fieldError.errors : []
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldError(fieldName: string): boolean {
    return this.errors.some((error) => error.field === fieldName)
  }

  /**
   * Get all field names that have errors
   */
  getErrorFields(): string[] {
    return this.errors.map((error) => error.field)
  }

  /**
   * Convert to JSON for serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      dtoClass: this.dtoClass,
      errors: this.errors,
      timestamp: this.timestamp.toISOString(),
    }
  }
}
