import { Test, type TestingModule } from "@nestjs/testing"
import { UnauthorizedException } from "@nestjs/common"
import { AuthMiddleware } from "../auth.middleware"
import type { AuthService } from "../../interfaces/auth.interface"
import type { Request, Response, NextFunction } from "express"
import { jest } from "@jest/globals"

describe("AuthMiddleware", () => {
  let middleware: AuthMiddleware
  let mockAuthService: jest.Mocked<AuthService>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(async () => {
    mockAuthService = {
      validateToken: jest.fn(),
      generateToken: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthMiddleware,
          useFactory: () => new AuthMiddleware(mockAuthService),
        },
      ],
    }).compile()

    middleware = module.get<AuthMiddleware>(AuthMiddleware)

    mockRequest = {
      headers: {},
    }
    mockResponse = {}
    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("use", () => {
    it("should call next() when valid token is provided", async () => {
      const mockUser = { id: "1", email: "test@example.com" }
      mockRequest.headers = { authorization: "Bearer valid-token" }
      mockAuthService.validateToken.mockResolvedValue(mockUser)

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockAuthService.validateToken).toHaveBeenCalledWith("valid-token")
      expect(mockRequest["user"]).toBe(mockUser)
      expect(mockNext).toHaveBeenCalled()
    })

    it("should throw UnauthorizedException when no token is provided", async () => {
      mockRequest.headers = {}

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        UnauthorizedException,
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should throw UnauthorizedException when token format is invalid", async () => {
      mockRequest.headers = { authorization: "InvalidFormat token" }

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        UnauthorizedException,
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should throw UnauthorizedException when token validation fails", async () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" }
      mockAuthService.validateToken.mockRejectedValue(new Error("Invalid token"))

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        UnauthorizedException,
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should work without auth service", async () => {
      const middlewareWithoutService = new AuthMiddleware()
      mockRequest.headers = { authorization: "Bearer any-token" }

      await middlewareWithoutService.use(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })
  })
})
