import { Injectable, type NestMiddleware, BadRequestException } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"

export interface ValidationRule {
  field: string
  required?: boolean
  type?: "string" | "number" | "boolean" | "email"
  minLength?: number
  maxLength?: number
  pattern?: RegExp
}

export interface ValidationOptions {
  body?: ValidationRule[]
  query?: ValidationRule[]
  params?: ValidationRule[]
}

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  constructor(private readonly options: ValidationOptions) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      if (this.options.body) {
        this.validateObject(req.body, this.options.body, "body")
      }

      if (this.options.query) {
        this.validateObject(req.query, this.options.query, "query")
      }

      if (this.options.params) {
        this.validateObject(req.params, this.options.params, "params")
      }

      next()
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  private validateObject(obj: any, rules: ValidationRule[], context: string) {
    for (const rule of rules) {
      const value = obj[rule.field]

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === "")) {
        throw new Error(`${context}.${rule.field} is required`)
      }

      // Skip validation if field is not present and not required
      if (value === undefined || value === null) {
        continue
      }

      // Type validation
      if (rule.type) {
        this.validateType(value, rule.type, `${context}.${rule.field}`)
      }

      // Length validation
      if (rule.minLength && value.length < rule.minLength) {
        throw new Error(`${context}.${rule.field} must be at least ${rule.minLength} characters`)
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        throw new Error(`${context}.${rule.field} must be at most ${rule.maxLength} characters`)
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        throw new Error(`${context}.${rule.field} format is invalid`)
      }
    }
  }

  private validateType(value: any, type: string, field: string) {
    switch (type) {
      case "string":
        if (typeof value !== "string") {
          throw new Error(`${field} must be a string`)
        }
        break
      case "number":
        if (typeof value !== "number" && isNaN(Number(value))) {
          throw new Error(`${field} must be a number`)
        }
        break
      case "boolean":
        if (typeof value !== "boolean" && value !== "true" && value !== "false") {
          throw new Error(`${field} must be a boolean`)
        }
        break
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          throw new Error(`${field} must be a valid email`)
        }
        break
    }
  }
}
