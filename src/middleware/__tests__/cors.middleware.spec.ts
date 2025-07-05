import { CorsMiddleware } from "../cors.middleware"
import type { Request, Response, NextFunction } from "express"
import { jest } from "@jest/globals"

describe("CorsMiddleware", () => {
  let middleware: CorsMiddleware
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let headerSpy: jest.Mock
  let statusSpy: jest.Mock
  let endSpy: jest.Mock

  beforeEach(() => {
    headerSpy = jest.fn()
    statusSpy = jest.fn().mockReturnThis()
    endSpy = jest.fn()

    mockRequest = {
      method: "GET",
      headers: {},
    }
    mockResponse = {
      header: headerSpy,
      status: statusSpy,
      end: endSpy,
    }
    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("default configuration", () => {
    beforeEach(() => {
      middleware = new CorsMiddleware()
    })

    it("should set default CORS headers", () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*")
      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Headers", "Content-Type, Authorization")
      expect(mockNext).toHaveBeenCalled()
    })

    it("should handle OPTIONS preflight request", () => {
      mockRequest.method = "OPTIONS"

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(statusSpy).toHaveBeenCalledWith(200)
      expect(endSpy).toHaveBeenCalled()
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe("custom configuration", () => {
    it("should use custom origin string", () => {
      middleware = new CorsMiddleware({ origin: "https://example.com" })

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://example.com")
    })

    it("should handle array of origins", () => {
      const origins = ["https://example.com", "https://test.com"]
      middleware = new CorsMiddleware({ origin: origins })
      mockRequest.headers = { origin: "https://example.com" }

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://example.com")
    })

    it("should not set origin header for non-allowed origins", () => {
      const origins = ["https://example.com"]
      middleware = new CorsMiddleware({ origin: origins })
      mockRequest.headers = { origin: "https://malicious.com" }

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(headerSpy).not.toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://malicious.com")
    })

    it("should set credentials header when enabled", () => {
      middleware = new CorsMiddleware({ credentials: true })

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Credentials", "true")
    })

    it("should use custom methods and headers", () => {
      middleware = new CorsMiddleware({
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "X-Custom-Header"],
      })

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Methods", "GET, POST")
      expect(headerSpy).toHaveBeenCalledWith("Access-Control-Allow-Headers", "Content-Type, X-Custom-Header")
    })
  })
})
