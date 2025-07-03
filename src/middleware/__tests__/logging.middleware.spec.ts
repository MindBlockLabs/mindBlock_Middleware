import { Logger } from "@nestjs/common"
import { LoggingMiddleware } from "../logging.middleware"
import type { Request, Response, NextFunction } from "express"
import jest from "jest"

// Mock the Logger
jest.mock("@nestjs/common", () => ({
  ...jest.requireActual("@nestjs/common"),
  Logger: {
    log: jest.fn(),
    error: jest.fn(),
  },
}))

describe("LoggingMiddleware", () => {
  let middleware: LoggingMiddleware
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let loggerSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    loggerSpy = jest.spyOn(Logger, "log").mockImplementation()
    errorSpy = jest.spyOn(Logger, "error").mockImplementation()

    mockRequest = {
      method: "GET",
      originalUrl: "/api/test",
      path: "/api/test",
      ip: "127.0.0.1",
      get: jest.fn().mockReturnValue("Mozilla/5.0"),
      headers: { "user-agent": "Mozilla/5.0" },
      body: {},
    }

    mockResponse = {
      statusCode: 200,
      end: jest.fn(),
    }

    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("default configuration", () => {
    beforeEach(() => {
      middleware = new LoggingMiddleware()
    })

    it("should log request and response", () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining("Incoming Request:"))
      expect(mockNext).toHaveBeenCalled()

      // Simulate response end
      const originalEnd = mockResponse.end as jest.Mock
      originalEnd.mock.calls[0][0]?.call(mockResponse)

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining("Response:"))
    })

    it("should log error responses", () => {
      mockResponse.statusCode = 500
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      // Simulate response end
      const originalEnd = mockResponse.end as jest.Mock
      originalEnd.mock.calls[0][0]?.call(mockResponse)

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Response Error:"))
    })
  })

  describe("custom configuration", () => {
    it("should include body when configured", () => {
      middleware = new LoggingMiddleware({ includeBody: true })
      mockRequest.body = { test: "data" }

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('"body":{"test":"data"}'))
    })

    it("should include headers when configured", () => {
      middleware = new LoggingMiddleware({ includeHeaders: true })

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('"headers"'))
    })

    it("should exclude specified paths", () => {
      middleware = new LoggingMiddleware({ excludePaths: ["/api/test"] })

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(loggerSpy).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })
  })
})
