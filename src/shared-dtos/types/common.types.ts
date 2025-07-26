/**
 * Common types and interfaces shared across the application
 */

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Pagination response
 */
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Sorting parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Query parameters combining pagination, sorting, and filtering
 */
export interface QueryParams extends PaginationParams, SortParams {
  filters?: FilterParams;
  search?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
  requestId?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: Date;
  requestId?: string;
  details?: any;
}

/**
 * Success response
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

/**
 * Request context
 */
export interface RequestContext {
  requestId: string;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Audit trail interface
 */
export interface AuditTrail {
  createdBy?: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
}

/**
 * Metadata interface
 */
export interface Metadata {
  [key: string]: any;
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  constraints?: string[];
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse {
  success: false;
  error: 'VALIDATION_ERROR';
  message: string;
  details: ValidationErrorDetail[];
  timestamp: Date;
  requestId?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string;
  tags?: string[];
}

/**
 * Rate limiting options
 */
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
}

/**
 * Database transaction options
 */
export interface TransactionOptions {
  isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  timeout?: number;
}

/**
 * Logging levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  requestId?: string;
  userId?: number;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
} 