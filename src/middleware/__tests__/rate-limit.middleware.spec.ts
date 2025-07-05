import { HttpException, HttpStatus } from "@nestjs/common"
import { RateLimitMiddleware } from "../rate-limit.middleware"
import type { Request, Response, NextFunction } from "express"
import { jest } from "@jest/globals"

describe("RateLimitMiddleware", () => {
  let middleware: RateLimitMiddleware
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let setSpy: jest.Mock

  beforeEach(() => {
    setSpy = jest.fn()

    mockRequest = {
      ip: "127.0.0.1",
    }
    mockResponse = {
      set: setSpy,
    }
    mockNext = jest.fn()

    // Reset time for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2023-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe("default configuration", () => {
    beforeEach(() => {
      middleware = new RateLimitMiddleware()
    })

    it("should allow first request", () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(setSpy).not.toHaveBeenCalled()
    })

    it("should track multiple requests from same IP", () => {
      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }

      expect(mockNext).toHaveBeenCalledTimes(5)
    })

    it("should block requests when limit exceeded", () => {
      // Make requests up to the limit (default is 100)
      for (let i = 0; i < 100; i++) {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }

      // Next request should be blocked
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(HttpException)

      expect(mockNext).toHaveBeenCalledTimes(100)
    })

    it("should set rate limit headers", () => {
      // Make a few requests to trigger header setting
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(setSpy).toHaveBeenCalledWith({
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "98",
        "X-RateLimit-Reset": expect.any(String),
      })
    })
  })

  describe("custom configuration", () => {
    it("should use custom limits", () => {
      middleware = new RateLimitMiddleware({ max: 2, windowMs: 60000 })

      // Make 2 requests (should pass)
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      // Third request should be blocked
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      }).toThrow(HttpException)
    })

    it("should use custom key generator", () => {
      const customKeyGenerator = jest.fn().mockReturnValue("custom-key")
      middleware = new RateLimitMiddleware({ keyGenerator: customKeyGenerator })

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(customKeyGenerator).toHaveBeenCalledWith(mockRequest)
    })

    it("should use custom error message", () => {
      const customMessage = "Custom rate limit message"
      middleware = new RateLimitMiddleware({ max: 1, message: customMessage })

      // First request passes
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      // Second request should throw with custom message
      try {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect(error.message).toBe(customMessage)
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
      }
    })

    it("should reset window after time expires", () => {
      middleware = new RateLimitMiddleware({ max: 1, windowMs: 60000 })

      // First request
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      // Advance time beyond window
      jest.advanceTimersByTime(61000)

      // Should allow request again
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(2)
    })
  })

  describe("cleanup", () => {
    it("should clean up expired entries", () => {
      middleware = new RateLimitMiddleware({ windowMs: 60000 })

      // Make request
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      // Advance time to trigger cleanup
      jest.advanceTimersByTime(61000)

      // Make another request (should trigger cleanup)
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(2)
    })
  })
})
