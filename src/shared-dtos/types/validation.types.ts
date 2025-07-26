/**
 * Validation types and interfaces for shared DTOs
 */

/**
 * Validation options for DTO validation
 */
export interface ValidationOptions {
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  transform?: boolean;
  forbidUnknownValues?: boolean;
  disableErrorMessages?: boolean;
  strictGroups?: boolean;
  dismissDefaultMessages?: boolean;
  validationError?: {
    target?: boolean;
    value?: boolean;
  };
  groups?: string[];
  always?: boolean;
  strict?: boolean;
}

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: string[];
  children?: ValidationError[];
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  field: string;
  message: string;
  value?: any;
  suggestion?: string;
}

/**
 * Validation schema interface
 */
export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

/**
 * Validation rule interface
 */
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message?: string;
  options?: any;
}

/**
 * Validation rule types
 */
export type ValidationRuleType =
  | 'required'
  | 'string'
  | 'number'
  | 'boolean'
  | 'email'
  | 'url'
  | 'date'
  | 'array'
  | 'object'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'enum'
  | 'custom';

/**
 * Custom validator function type
 */
export type CustomValidator = (value: any, options?: any) => boolean | Promise<boolean>;

/**
 * Validation decorator options
 */
export interface ValidationDecoratorOptions {
  message?: string;
  groups?: string[];
  always?: boolean;
  strict?: boolean;
  each?: boolean;
  context?: any;
}

/**
 * Field validation metadata
 */
export interface FieldValidationMetadata {
  field: string;
  rules: ValidationRule[];
  isRequired: boolean;
  isOptional: boolean;
  type: string;
  transform?: (value: any) => any;
}

/**
 * DTO validation metadata
 */
export interface DtoValidationMetadata {
  className: string;
  fields: FieldValidationMetadata[];
  customValidators?: CustomValidator[];
}

/**
 * Validation context
 */
export interface ValidationContext {
  object: any;
  property: string;
  value: any;
  target?: any;
  constraints?: any[];
  groups?: string[];
}

/**
 * Validation pipeline step
 */
export interface ValidationPipelineStep {
  name: string;
  execute: (context: ValidationContext) => Promise<ValidationResult>;
  priority?: number;
}

/**
 * Validation pipeline
 */
export interface ValidationPipeline {
  steps: ValidationPipelineStep[];
  execute: (data: any, schema: ValidationSchema) => Promise<ValidationResult>;
}

/**
 * Validation cache entry
 */
export interface ValidationCacheEntry {
  schema: ValidationSchema;
  compiled: any;
  timestamp: number;
  ttl: number;
}

/**
 * Validation cache interface
 */
export interface ValidationCache {
  get: (key: string) => ValidationCacheEntry | null;
  set: (key: string, entry: ValidationCacheEntry) => void;
  clear: () => void;
  has: (key: string) => boolean;
}

/**
 * Validation performance metrics
 */
export interface ValidationMetrics {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  averageValidationTime: number;
  cacheHitRate: number;
  lastValidationTime: Date;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  enableCache: boolean;
  cacheTTL: number;
  enableMetrics: boolean;
  strictMode: boolean;
  transformMode: 'excludeAll' | 'exposeAll' | 'exposeUnsetFields';
  whitelist: boolean;
  forbidNonWhitelisted: boolean;
  forbidUnknownValues: boolean;
  disableErrorMessages: boolean;
  skipMissingProperties: boolean;
  validationError: {
    target: boolean;
    value: boolean;
  };
} 