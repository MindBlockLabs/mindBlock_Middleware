import { BadRequestException } from "@nestjs/common"
import { ValidationMiddleware } from "../validation.middleware"
import type { Request, Response, NextFunction } from "express"
import { jest } from "@jest/globals"

describe("ValidationMiddleware", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    }
    mockResponse = {}
    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("body validation", () => {
    it("should pass valid body data", () => {
      const middleware = new ValidationMiddleware({
        body: [
          { field: "email", required: true, type: "email" },
          { field: "name", required: true, type: "string" },
        ],
      })

      mockRequest.body = {
        email: "test@example.com",
        name: "John Doe",
      }

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it("should throw error for missing required field", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "email", required: true }],
      })

      mockRequest.body = {}

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })

    it("should validate email format", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "email", type: "email" }],
      })

      mockRequest.body = { email: "invalid-email" }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })

    it("should validate string type", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "name", type: "string" }],
      })

      mockRequest.body = { name: 123 }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })

    it("should validate number type", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "age", type: "number" }],
      })

      mockRequest.body = { age: "not-a-number" }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })

    it("should validate boolean type", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "active", type: "boolean" }],
      })

      mockRequest.body = { active: "maybe" }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })

    it("should validate minimum length", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "password", minLength: 8 }],
      })

      mockRequest.body = { password: "123" }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })

    it("should validate maximum length", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "name", maxLength: 10 }],
      })

      mockRequest.body = { name: "This name is too long" }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })

    it("should validate pattern", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "code", pattern: /^[A-Z]{3}\d{3}$/ }],
      })

      mockRequest.body = { code: "invalid" }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })
  })

  describe("query validation", () => {
    it("should validate query parameters", () => {
      const middleware = new ValidationMiddleware({
        query: [
          { field: "page", type: "number" },
          { field: "limit", type: "number" },
        ],
      })

      mockRequest.query = { page: "1", limit: "10" }

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it("should throw error for invalid query parameter", () => {
      const middleware = new ValidationMiddleware({
        query: [{ field: "page", type: "number" }],
      })

      mockRequest.query = { page: "invalid" }

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })
  })

  describe("params validation", () => {
    it("should validate route parameters", () => {
      const middleware = new ValidationMiddleware({
        params: [{ field: "id", required: true, type: "string" }],
      })

      mockRequest.params = { id: "123" }

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it("should throw error for missing required param", () => {
      const middleware = new ValidationMiddleware({
        params: [{ field: "id", required: true }],
      })

      mockRequest.params = {}

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(BadRequestException)
    })
  })

  describe("optional fields", () => {
    it("should skip validation for optional missing fields", () => {
      const middleware = new ValidationMiddleware({
        body: [{ field: "optional", type: "string" }],
      })

      mockRequest.body = {}

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })
  })
})
